import { useState } from 'react';
import { UploadCloud, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import './Upload.css';

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Analyzing...");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setStatusMsg("Uploading resume...");
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // 1. Upload File
      const res = await api.post('/resume/upload', formData);
      const interviewId = res.data.interview_id;
      setStatusMsg("AI is parsing your resume...");

      // 2. Poll Status
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await api.get(`/interview/${interviewId}/status`);
          if (statusRes.data.status === 'ready' || statusRes.data.status === 'in_progress') {
            clearInterval(pollInterval);
            setIsUploading(false);
            setSuccess(true);
            setTimeout(() => navigate(`/interview?id=${interviewId}`), 1500);
          }
        } catch (pollErr) {
          console.error("Polling error", pollErr);
        }
      }, 2000);

    } catch (error) {
      console.error(error);
      setIsUploading(false);
      alert("Failed to upload resume.");
    }
  };

  return (
    <div className="upload-container animate-fade-in">
      <div className="upload-header">
        <h2>Submit your profile</h2>
        <p>Our AI will instantly parse your resume and generate an ATS score.</p>
      </div>

      <div className="glass-panel upload-card">
        {!success ? (
          <>
            <label className="upload-zone">
              <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" hidden />
              <UploadCloud size={48} className="upload-icon" />
              <h3>{file ? file.name : "Drag & drop your resume"}</h3>
              <p className="subtext">PDF, DOCX up to 10MB</p>
            </label>
            
            <button 
              className="btn-primary upload-btn" 
              onClick={handleUpload} 
              disabled={!file || isUploading}
            >
              {isUploading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 className="spinner" size={20} />
                  <span>{statusMsg}</span>
                </div>
              ) : "Upload & Analyze"}
            </button>
          </>
        ) : (
          <div className="success-state">
            <CheckCircle size={64} className="success-icon animate-pop" />
            <h3>Resume Analyzed!</h3>
            <p>Initializing AI Interview session...</p>
          </div>
        )}
      </div>
    </div>
  );
}
