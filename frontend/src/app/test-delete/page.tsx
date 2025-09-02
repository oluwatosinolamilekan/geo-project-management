'use client';

import { useState } from 'react';
import { deleteRegion } from '@/lib/server-actions';

export default function TestDeletePage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testDelete = async () => {
    setLoading(true);
    setResult('Testing delete...');
    
    try {
      const formData = new FormData();
      formData.append('id', '6'); // North America region
      
      console.log('Testing delete region with ID: 6');
      const response = await deleteRegion(formData);
      
      console.log('Delete response:', response);
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('Test error:', error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Delete Region</h1>
      <button 
        onClick={testDelete}
        disabled={loading}
        className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Delete Region 6'}
      </button>
      
      {result && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
