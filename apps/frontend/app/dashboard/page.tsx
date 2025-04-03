"use client";
import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Globe, Plus, Moon, Sun, AlertCircle } from 'lucide-react';
import { useWebsites } from '@/hooks/useWebsites';
import axios from 'axios';
import { API_BACKEND_URL } from '@/config';
import { useAuth } from '@clerk/nextjs';

type UptimeStatus = "good" | "bad" | "unknown";

function StatusCircle({ status }: { status: UptimeStatus }) {
  return (
    <div className={`w-3 h-3 rounded-full ${status === 'good' ? 'bg-green-500' : status === 'bad' ? 'bg-red-500' : 'bg-gray-500'}`} />
  );
}

async function deleteWebsite(websiteId: string) {
  const url = `http://localhost:8080/api/v1/website/${websiteId}`;
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include' // If you're using cookies/sessions
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete website');
    }

    return await response.json();
  } catch (error) {
    console.error("Delete error:", error);
    throw error; // Re-throw to handle in your UI
  }
}

function UptimeTicks({ ticks }: { ticks: UptimeStatus[] }) {
  return (
    <div className="flex gap-1 mt-2">
      {ticks.map((tick, index) => (
        <div
          key={index}
          className={`w-8 h-2 rounded ${
            tick === 'good' ? 'bg-green-500' : tick === 'bad' ? 'bg-red-500' : 'bg-gray-500'
          }`}
        />
      ))}
    </div>
  );
}

function CreateWebsiteModal({ isOpen, onClose, error }: { isOpen: boolean; onClose: (url: string | null) => void; error: string | null }) {
  const [url, setUrl] = useState('');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Add New Website</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL
          </label>
          <input
            type="url"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => onClose(null)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={() => onClose(url)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Add Website
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProcessedWebsite {
  id: string;
  url: string;
  status: UptimeStatus;
  uptimePercentage: number;
  lastChecked: string;
  uptimeTicks: UptimeStatus[];
}

function WebsiteCard({ website, onDelete }: { website: ProcessedWebsite; onDelete: (id: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <StatusCircle status={website.status} />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{website.url}</h3>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {website.uptimePercentage.toFixed(1)}% uptime
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteWebsite(website.id).then(() => onDelete(website.id));
            }}
            className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            title="Delete website"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
          <div className="mt-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Last 30 minutes status:</p>
            <UptimeTicks ticks={website.uptimeTicks} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Last checked: {website.lastChecked}
          </p>
        </div>
      )}
    </div>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addWebsiteError, setAddWebsiteError] = useState<string | null>(null);
  const { websites, refreshWebsites, loading, error } = useWebsites();
  const { getToken } = useAuth();

  const processedWebsites = useMemo(() => {
    return websites.map(website => {
      // Sort ticks by creation time
      const sortedTicks = [...website.ticks].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Get the most recent 30 minutes of ticks
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const recentTicks = sortedTicks.filter(tick => 
        new Date(tick.createdAt) > thirtyMinutesAgo
      );

      // Aggregate ticks into 3-minute windows (10 windows total)
      const windows: UptimeStatus[] = [];

      for (let i = 0; i < 10; i++) {
        const windowStart = new Date(Date.now() - (i + 1) * 3 * 60 * 1000);
        const windowEnd = new Date(Date.now() - i * 3 * 60 * 1000);
        
        const windowTicks = recentTicks.filter(tick => {
          const tickTime = new Date(tick.createdAt);
          return tickTime >= windowStart && tickTime < windowEnd;
        });

        // Window is considered up if majority of ticks are up
        const upTicks = windowTicks.filter(tick => tick.status === 'Good').length;
        windows[9 - i] = windowTicks.length === 0 ? "unknown" : (upTicks / windowTicks.length) >= 0.5 ? "good" : "bad";
      }

      // Calculate overall status and uptime percentage
      const totalTicks = sortedTicks.length;
      const upTicks = sortedTicks.filter(tick => tick.status === 'Good').length;
      const uptimePercentage = totalTicks === 0 ? 100 : (upTicks / totalTicks) * 100;

      // Get the most recent status
      const currentStatus = windows[windows.length - 1];

      // Format the last checked time
      const lastChecked = sortedTicks[0]
        ? new Date(sortedTicks[0].createdAt).toLocaleTimeString()
        : 'Never';

      return {
        id: website.id,
        url: website.url,
        status: currentStatus,
        uptimePercentage,
        lastChecked,
        uptimeTicks: windows,
      };
    });
  }, [websites]);

  // Toggle dark mode
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleAddWebsite = async (url: string | null) => {
    if (url === null) {
      setIsModalOpen(false);
      setAddWebsiteError(null);
      return;
    }

    try {
      // Validate URL format
      try {
        new URL(url);
      } catch (e) {
        setAddWebsiteError("Please enter a valid URL including http:// or https://");
        return;
      }
      
      const token = await getToken();
      
      // Configure axios with CORS handling
      const config = {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        withCredentials: false // This can help with certain CORS issues
      };
      
      await axios.post(
        `${API_BACKEND_URL}/api/v1/website`, 
        { url },
        config
      );
      
      setIsModalOpen(false);
      setAddWebsiteError(null);
      refreshWebsites();
    } catch (err) {
      console.error("Error adding website:", err);
      
      // Handle different error types
      if (axios.isAxiosError(err)) {
        if (err.code === 'ERR_NETWORK') {
          setAddWebsiteError("Network error. Please check your connection and the server status.");
        } else if (err.response) {
          // Server responded with a status code outside of 2xx range
          setAddWebsiteError(`Server error: ${err.response.data?.message || err.response.statusText || 'Unknown error'}`);
        } else if (err.request) {
          // Request was made but no response was received - likely CORS error
          setAddWebsiteError("Unable to reach the server. This may be due to CORS restrictions. Please check your server configuration.");
        } else {
          setAddWebsiteError(`Error: ${err.message}`);
        }
      } else {
        setAddWebsiteError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const openModalAndResetError = () => {
    setAddWebsiteError(null);
    setIsModalOpen(true);
  };

  const handleDeleteWebsite = async (id: string) => {
    try {
      const token = await getToken();
      const config = {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        withCredentials: false
      };

      await axios.delete(
        `${API_BACKEND_URL}/api/v1/website/${id}`,
        config
      );
      
      refreshWebsites();
    } catch (err) {
      console.error("Error deleting website:", err);
      // You might want to show an error toast/notification here
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Uptime Monitor</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <button
              onClick={openModalAndResetError}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Website</span>
            </button>
          </div>
        </div>
        
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">Loading websites...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {!loading && !error && processedWebsites.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300 mb-4">No websites added yet</p>
            <button
              onClick={openModalAndResetError}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Add Your First Website
            </button>
          </div>
        )}
        
        <div className="space-y-4">
          {processedWebsites.map((website) => (
            <WebsiteCard 
              key={website.id} 
              website={website} 
              onDelete={handleDeleteWebsite}
            />
          ))}
        </div>
      </div>

      <CreateWebsiteModal
        isOpen={isModalOpen}
        onClose={handleAddWebsite}
        error={addWebsiteError}
      />
    </div>
  );
}

export default App;