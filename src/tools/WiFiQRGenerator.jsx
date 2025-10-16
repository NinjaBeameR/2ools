import React, { useState } from 'react';
import { Wifi, QrCode, Download } from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';

function WiFiQRGenerator() {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [security, setSecurity] = useState('WPA');
  const [hidden, setHidden] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  const generateQR = () => {
    if (!ssid) {
      alert('Please enter WiFi network name (SSID)');
      return;
    }

    // WiFi QR code format: WIFI:T:WPA;S:mynetwork;P:mypassword;H:false;;
    const wifiString = `WIFI:T:${security};S:${ssid};P:${password};H:${hidden};;`;

    const qrCodeInstance = new QRCodeStyling({
      width: 300,
      height: 300,
      data: wifiString,
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'H'
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 0
      },
      dotsOptions: {
        type: 'rounded',
        color: '#000000'
      },
      backgroundOptions: {
        color: '#ffffff'
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
        color: '#000000'
      },
      cornersDotOptions: {
        type: 'dot',
        color: '#000000'
      }
    });

    setQrCode(qrCodeInstance);

    // Display QR code
    setTimeout(() => {
      const container = document.getElementById('qr-container');
      if (container) {
        container.innerHTML = '';
        qrCodeInstance.append(container);
      }
    }, 0);
  };

  const downloadQR = () => {
    if (qrCode) {
      qrCode.download({
        name: `wifi-${ssid}`,
        extension: 'png'
      });
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">WiFi QR Code Generator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Wifi size={24} />
            WiFi Settings
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Network Name (SSID) *
              </label>
              <input
                type="text"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                placeholder="MyWiFiNetwork"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="yourpassword123"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for open networks</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Type
              </label>
              <select
                value={security}
                onChange={(e) => setSecurity(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="hidden"
                checked={hidden}
                onChange={(e) => setHidden(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="hidden" className="ml-2 text-sm text-gray-700">
                Hidden Network
              </label>
            </div>

            <button
              onClick={generateQR}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <QrCode size={20} />
              Generate QR Code
            </button>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">QR Code</h2>

          <div className="flex-1 flex items-center justify-center">
            {qrCode ? (
              <div className="text-center">
                <div id="qr-container" className="inline-block mb-4"></div>
                <button
                  onClick={downloadQR}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mx-auto"
                >
                  <Download size={20} />
                  Download QR Code
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <QrCode size={64} className="mx-auto mb-4 opacity-30" />
                <p>Fill in the details and click "Generate QR Code"</p>
              </div>
            )}
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>How to use:</strong> Scan this QR code with your phone's camera to automatically
              connect to the WiFi network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WiFiQRGenerator;
