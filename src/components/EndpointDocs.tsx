import React, { useState } from 'react';
import { Code2, Copy, Check, Info, FileText } from 'lucide-react';

interface EndpointDocsProps {
  apiKeySample?: string;
}

export const EndpointDocs: React.FC<EndpointDocsProps> = ({ apiKeySample = 'YOUR_KEY' }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const baseUrl = window.location.origin;
  const endpointPath = `/api/number.php?key=${apiKeySample}&num=9876543210`;
  const fullUrl = `${baseUrl}${endpointPath}`;
  const curlCmd = `curl -s "${baseUrl}/api/number.php?key=${apiKeySample}&num=9876543210"`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCmd);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div id="endpoint-section" className="bg-white border border-gray-200 rounded-md p-5 sm:p-6 mb-6 shadow-xs">
      <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-5">
        <div className="w-8 h-8 rounded bg-[#eef1f5] text-gray-800 flex items-center justify-center shrink-0">
          <Code2 className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-none">
            API Endpoint & Gateway
          </h3>
          <span className="text-xs text-gray-400 mt-1 block">
            HTTP REST specifications and integration guides
          </span>
        </div>
      </div>

      {/* Terminal style endpoint box from anish.php */}
      <div className="bg-[#2b2b2b] text-[#e8e8e8] rounded-md p-4 font-mono text-xs mb-3 shadow-inner">
        <div className="text-gray-400 font-sans font-semibold mb-2 flex items-center justify-between">
          <span>Base URL: {baseUrl}</span>
          <button
            type="button"
            onClick={handleCopyUrl}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-sans transition"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'Copied URL' : 'Copy URL'}</span>
          </button>
        </div>
        <div className="flex items-start sm:items-center gap-3 overflow-x-auto py-1">
          <span className="text-[#f0a04b] font-bold min-w-12">GET</span>
          <span className="text-[#e8e8e8] break-all">{fullUrl}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
        <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span>
          Replace <strong>{apiKeySample}</strong> with a valid registered API key. The number must be 10 digits without country code.
        </span>
      </div>

      {/* cURL Snippet */}
      <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-5 flex items-center justify-between gap-2">
        <div className="overflow-x-auto text-xs font-mono text-gray-800">
          <code>{curlCmd}</code>
        </div>
        <button
          type="button"
          onClick={handleCopyCurl}
          className="shrink-0 px-2.5 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-100 transition flex items-center gap-1"
        >
          {copiedCurl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
        </button>
      </div>

      {/* Parameters Table */}
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
        Query Parameters
      </h4>
      <div className="overflow-x-auto mb-5">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
              <th className="py-2 px-3">Parameter</th>
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Required</th>
              <th className="py-2 px-3">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            <tr>
              <td className="py-2 px-3 font-mono font-semibold text-gray-900">key</td>
              <td className="py-2 px-3 font-mono text-gray-500">string</td>
              <td className="py-2 px-3 text-red-600 font-semibold">Yes</td>
              <td className="py-2 px-3">Your registered API authorization key</td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-mono font-semibold text-gray-900">num</td>
              <td className="py-2 px-3 font-mono text-gray-500">string</td>
              <td className="py-2 px-3 text-red-600 font-semibold">Yes</td>
              <td className="py-2 px-3">10-digit Indian mobile number (e.g. 9876543210)</td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-mono font-semibold text-gray-900">debug</td>
              <td className="py-2 px-3 font-mono text-gray-500">boolean</td>
              <td className="py-2 px-3 text-gray-400">No</td>
              <td className="py-2 px-3">Set to 1 to view request quota metadata & trace info</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Response format explanation */}
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
        Expected JSON Response
      </h4>
      <div className="bg-[#1e1e1e] text-emerald-400 rounded p-3 text-xs font-mono overflow-x-auto">
        <pre>{`{
  "username": "anish_master_key",
  "type": "number",
  "data": {
    "number": "9876543210",
    "valid": true,
    "carrier": "Bharti Airtel",
    "circle": "Punjab & Chandigarh",
    "region": "North",
    "line_type": "Mobile (GSM/LTE/5G)",
    "series": "98765",
    "mcc": "404",
    "mnc": "76",
    "country": "India",
    "country_code": "+91"
  },
  "BUY_API": "@Vectraen",
  "SUPPORT": "@Vectraen"
}`}</pre>
      </div>
    </div>
  );
};
