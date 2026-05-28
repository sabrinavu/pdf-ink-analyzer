import React, { useState } from 'react'; 

const Uploader = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        setError(null);

        const file = e.dataTransfer.files[0];
        if (file) await processFile(file);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) await processFile(file);
    };

    const processFile = async (file) => {
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            setError("Invalid PDF File.");
            return;
        }
        setLoading(true);
        setResults(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/analyze/', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Analysis failed.");

            setResults(data);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }; 

    return (
        <div style={{ maxWidth: '500px', margin: '40px auto', fontFamily: 'sans-serif' }}>
          <h2>Poster Ink Analyzer</h2>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: isDragging ? '2px dashed #0070f3' : '2px dashed #ccc',
              backgroundColor: isDragging ? '#f0f7ff' : '#fafafa',
              padding: '40px',
              textAlign: 'center',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <p>{loading ? "Analyzing ink pixels..." : "Drag & drop your 1-page PDF poster here, or click to browse"}</p>
            <input
              id="fileInput"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
    
          {error && (
            <div style={{ color: 'red', marginTop: '20px', padding: '10px', backgroundColor: '#fff5f5', borderRadius: '4px' }}>
              <strong>Error:</strong> {error}
            </div>
          )}
    
          {results && (
            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
              <h3>Analysis Complete</h3>
              <p><strong>Page Count:</strong> {results.page}</p>
              <p><strong>Ink Coverage:</strong> {results.ink_coverage}%</p>
              <p><strong>Uninked White Space:</strong> {results.white_space}%</p>
            </div>
          )}
        </div>
    );
}; 
    
export default Uploader; 