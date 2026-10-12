import React, { useState } from 'react';
import api from '../services/api';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download, FileText } from 'lucide-react';

export default function AdminUserImportPage() {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleDownloadSample = () => {
    const csvContent =
      'name,email,collegeId,role,academicYear,password\n' +
      'Rahul Roy,rahul.roy@student.campuscare.edu,2024CSE101,student,1st Year / 2nd Sem,CampusCare@2026\n' +
      'Pooja Nair,pooja.nair@campuscare.edu,FAC-201,faculty,,CampusCare@2026\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campuscare_accounts_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a valid CSV file.');
      return;
    }

    try {
      setImporting(true);
      setError('');
      setResult(null);

      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/admin/users/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process bulk import.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Bulk Account Provisioning</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Import hundreds of student or faculty accounts via authorized CSV spreadsheets.
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-primary-600" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Bulk Import Executed Successfully</span>
          </div>
          <p className="text-xs mt-1 text-emerald-800">
            Imported: <strong>{result.importedCount}</strong> accounts. Skipped/Duplicate: <strong>{result.errors?.length || 0}</strong>.
          </p>
          {result.errors && result.errors.length > 0 && (
            <div className="mt-3 p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs text-slate-600 max-h-36 overflow-y-auto">
              <p className="font-semibold text-slate-800 mb-1">Row Skipped Details:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {result.errors.map((e, idx) => (
                  <li key={idx}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Upload Box */}
      <form onSubmit={handleImportSubmit} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Select Spreadsheet File (.CSV)
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50/50 transition-colors">
            <FileSpreadsheet className="w-10 h-10 text-primary-600 mx-auto mb-2" />
            <p className="text-xs text-slate-700 font-semibold">
              {file ? file.name : 'Drag and drop accounts.csv or browse'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              File must contain columns: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">name, email, collegeId, role</code>
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="hidden"
              id="csv-file-upload"
            />
            <label
              htmlFor="csv-file-upload"
              className="mt-4 inline-block px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
            >
              Browse CSV File
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={importing || !file}
          className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {importing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Parsing and Provisioning Accounts...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Execute Bulk Import</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
