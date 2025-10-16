import React, { useState } from 'react';
import { Globe, Loader, MapPin, Server } from 'lucide-react';

function IPDomainLookup() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const lookup = async () => {
    if (!query) {
      alert('Please enter an IP address or domain');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Using ip-api.com (free, no API key required, 45 req/min)
      const response = await fetch(`http://ip-api.com/json/${query}`);
      const data = await response.json();

      if (data.status === 'success') {
        setResult(data);
      } else {
        alert('Failed to lookup: ' + data.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">IP / Domain Lookup</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter IP Address or Domain
        </label>
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="8.8.8.8 or google.com"
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            onKeyPress={(e) => e.key === 'Enter' && lookup()}
          />
          <button
            onClick={lookup}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Looking up...
              </>
            ) : (
              <>
                <Globe size={20} />
                Lookup
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-lg shadow-lg p-6 flex-1 overflow-auto">
          <h2 className="text-2xl font-semibold mb-6">Lookup Results</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard icon={<Server />} title="IP Information">
              <InfoRow label="IP Address" value={result.query} />
              <InfoRow label="ISP" value={result.isp} />
              <InfoRow label="Organization" value={result.org} />
              <InfoRow label="AS Number" value={result.as} />
            </InfoCard>

            <InfoCard icon={<MapPin />} title="Location">
              <InfoRow label="Country" value={`${result.country} (${result.countryCode})`} />
              <InfoRow label="Region" value={`${result.regionName} (${result.region})`} />
              <InfoRow label="City" value={result.city} />
              <InfoRow label="ZIP Code" value={result.zip} />
              <InfoRow label="Timezone" value={result.timezone} />
              <InfoRow label="Coordinates" value={`${result.lat}, ${result.lon}`} />
            </InfoCard>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="bg-white rounded-lg shadow-lg p-6 flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Globe size={64} className="mx-auto mb-4 opacity-30" />
            <p>Enter an IP address or domain to lookup</p>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon, title, children }) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value || 'N/A'}</span>
    </div>
  );
}

export default IPDomainLookup;
