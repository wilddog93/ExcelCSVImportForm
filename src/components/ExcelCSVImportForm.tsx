import { Button, Card, CardBody, CardFooter, CardHeader, Input } from '@nextui-org/react'
import { useState } from 'react'
import * as XLSX from 'xlsx'

interface FormData {
  name?: string
  email?: string
  age?: string
}

export default function ExcelCSVImportForm() {
  const [formData, setFormData] = useState<FormData[]>([
    {
      name: '',
      email: '',
      age: '',
    }
  ])

  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
  
    if (file) {
      const reader = new FileReader();
  
      reader.onload = (evt) => {
        try {
          if (evt.target) {
            const arrayBuffer = evt.target.result as ArrayBuffer;
            const wb = XLSX.read(arrayBuffer, { type: 'array' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
  
            // Read the data, with the first row as header
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];
            console.log(data)
            if (data.length > 1) {
              const [headers, ...rows] = data;  // Destructure the first row as headers
  
              // Ensure the required headers are present
              const nameIndex = headers.indexOf('Name');
              const emailIndex = headers.indexOf('Email');
              const ageIndex = headers.indexOf('Age');

              if (nameIndex === -1 || emailIndex === -1 || ageIndex === -1) {
                throw new Error('Invalid headers. Ensure the columns are labeled Name, Email, and Age.');
              }
  
              const newData: FormData[] = rows.map((row) => {
                const name = row[nameIndex];
                const email = row[emailIndex];
                const age = row[ageIndex];
  
                if (name && email && age) {
                  return {
                    name: name as string,
                    email: email as string,
                    age: age.toString(), // Convert number to string for consistency
                  };
                } else {
                  throw new Error('Invalid row data. Ensure each row has Name, Email, and Age.');
                }
              });
  
              setFormData(newData); // Update state with the parsed data
            } else {
              throw new Error('The file appears to be empty or missing data.');
            }
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : 'An unknown error occurred while parsing the file.');
        }
      };
  
      reader.onerror = () => {
        setError('An error occurred while reading the file.');
      };
  
      reader.readAsArrayBuffer(file); // Read as ArrayBuffer for better compatibility
    }
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
                  id="email"
                  name="email"
                  type="email"
                  label='Email'
                  value={data.email}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  id="age"
                  name="age"
                  type="number"
                  label='Age'
                  value={data.age}
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