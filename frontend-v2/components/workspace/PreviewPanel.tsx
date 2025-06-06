'use client'

import { useState } from 'react'
import { RefreshCw, ExternalLink, Smartphone, Tablet, Monitor, RotateCcw } from 'lucide-react'

export default function PreviewPanel() {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const deviceSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' },
  }

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Preview Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-semibold text-gray-200">Live Preview</h3>
          <div className="text-xs text-gray-400">localhost:3000</div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Device Selection */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-2 rounded transition-colors ${
                device === 'desktop'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-2 rounded transition-colors ${
                device === 'tablet'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-2 rounded transition-colors ${
                device === 'mobile'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh Preview"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-gray-900 p-4">
        <div className="h-full flex items-center justify-center">
          <div
            className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
            style={{
              width: deviceSizes[device].width,
              height: deviceSizes[device].height,
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            {/* Mock Preview Content */}
            <div className="h-full flex flex-col">
              {/* Mock Header */}
              <div className="bg-blue-600 text-white p-4">
                <h1 className="text-xl font-bold">ZeroCostxCode App</h1>
                <p className="text-blue-100">Building amazing applications</p>
              </div>

              {/* Mock Content */}
              <div className="flex-1 p-6 bg-gray-50">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Welcome!</h2>
                    <p className="text-gray-600">
                      This is a live preview of your application. Changes will appear here automatically.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-medium text-gray-800 mb-2">Feature 1</h3>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-medium text-gray-800 mb-2">Feature 2</h3>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-medium text-gray-800 mb-2">Interactive Elements</h3>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Primary
                      </button>
                      <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                        Secondary
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-800 bg-gray-900/50 text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Auto-refresh: On</span>
          <span>Last updated: Just now</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>{deviceSizes[device].width} × {deviceSizes[device].height}</span>
        </div>
      </div>
    </div>
  )
}