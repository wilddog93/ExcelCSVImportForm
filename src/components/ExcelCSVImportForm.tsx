import { Button, Card, CardBody, CardFooter, CardHeader, Input } from '@nextui-org/react'
import { useState } from 'react'
import * as XLSX from 'xlsx'

interface FormData {
  name?: string
  type?: string
  mode?: string
}

export default function ExcelCSVImportForm() {
  const [formData, setFormData] = useState<FormData[]>([
    {
      name: '',
      type: '',
      mode: '',
    }
  ])

  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
  
    // Get all files from the input
    const files = e.target.files;
    if (!files) return;
  
    const formDataArray: FormData[] = [];
  
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const data = await readFile(file); // Read and parse file asynchronously
  
        if (data.length > 1) {
          const [headers, ...rows] = data;
  
          // Ensure the required headers are present
          const nameIndex = headers.indexOf('COLUMN_NAME');
          const typeIndex = headers.indexOf('DATA_TYPE');
          const modeIndex = headers.indexOf('IS_NULLABLE');
  
          if (nameIndex === -1 || typeIndex === -1 || modeIndex === -1) {
            throw new Error(`File "${file.name}" has invalid headers. Ensure the columns are labeled Name as COLUMN_NAME, Type as DATA_TYPE, and Mode as IS_NULLABLE.`);
          }
  
          const newFileData: FormData[] = rows.map((row) => {
            const name = row[nameIndex];
            const type = row[typeIndex];
            const mode = row[modeIndex];
  
            if (name && type && mode) {
              return {
                name: name as string,
                type: type as string,
                mode: mode as string,
              };
            } else {
              throw new Error(`File "${file.name}" has invalid row data. Ensure each row has COLUMN_NAME, DATA_TYPE, and IS_NULLABLE.`);
            }
          });
  
          formDataArray.push(...newFileData); // Merge data from all files
        } else {
          throw new Error(`The file "${file.name}" appears to be empty or missing data.`);
        }
      }
  
      setFormData(formDataArray); // Update state with the combined data from all files
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred while parsing the file.');
    }
  };
  
  // Helper function to read and parse the file using async/await
  const readFile = (file: File): Promise<string[][]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = (evt) => {
        if (evt.target) {
          try {
            const arrayBuffer = evt.target.result as ArrayBuffer;
            const wb = XLSX.read(arrayBuffer, { type: 'array' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
  
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];
            resolve(data);
          } catch (error) {
            reject(error);
          }
        }
      };
  
      reader.onerror = () => {
        reject('An error occurred while reading the file.');
      };
  
      reader.readAsArrayBuffer(file); // Read as ArrayBuffer for better compatibility
    });
  };  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Here you would typically send the data to a server
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <h2 className='font-bold'>Import Excel/CSV Data</h2>
      </CardHeader>
      <CardBody>
        <div className="mb-4">
          <Input
            id="file-upload"
            type="file"
            label="Upload Excel File"
            aria-describedby="file-upload-error"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            fullWidth
            variant='bordered'
          />
          {error && (
            <div>{error}</div>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          {formData?.length > 0 &&
            formData?.map((data, index) => (
              <div key={index} className="w-full flex gap-2 items-center mb-3">
                <Input
                  id="name"
                  name="name"
                  label='Name'
                  value={data.name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  id="type"
                  name="type"
                  type="type"
                  label='Type'
                  value={data.type}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  id="mode"
                  name="mode"
                  type="text"
                  label='Mode'
                  value={data.mode}
                  onChange={handleInputChange}
                  required
                />
              </div>
            ))
          }
          <CardFooter className="flex justify-end mt-4 p-0">
            <Button variant='bordered' color='secondary' type="submit">Submit</Button>
          </CardFooter>
        </form>
      </CardBody>
    </Card>
  )
}