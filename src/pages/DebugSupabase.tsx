import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { checkSupabaseSetup } from '@/utils/checkSupabase';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Database, Table, CheckCircle, XCircle } from 'lucide-react';

const DebugSupabase: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableStatus, setTableStatus] = useState<{[key: string]: boolean | null}>({
    driver_profiles: null,
    delivery_requests: null,
    users: null
  });
  
  // Capture console logs
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    
    console.log = (...args) => {
      originalConsoleLog(...args);
      setLogs(prev => [...prev, args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')]);
    };
    
    console.error = (...args) => {
      originalConsoleError(...args);
      setLogs(prev => [...prev, `ERROR: ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`]);
    };
    
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  }, []);
  
  const runDiagnostics = async () => {
    setLogs([]);
    setLoading(true);
    
    try {
      await checkSupabaseSetup();
      
      // Check each table individually for more specific feedback
      for (const table of ['driver_profiles', 'delivery_requests', 'users']) {
        const { error } = await supabase.from(table).select('count(*)', { head: true });
        setTableStatus(prev => ({
          ...prev,
          [table]: !error
        }));
      }
    } catch (e) {
      console.error('Error running diagnostics:', e);
    } finally {
      setLoading(false);
    }
  };
  
  const createDriverProfilesTable = async () => {
    setLoading(true);
    setLogs(prev => [...prev, "Attempting to create driver_profiles table..."]);
    
    try {
      const { error } = await supabase.rpc('create_driver_profiles_table');
      
      if (error) {
        setLogs(prev => [...prev, `Error creating table: ${error.message}`]);
        
        // Plan B: Try to create the table directly with SQL
        setLogs(prev => [...prev, "Trying alternative approach with direct SQL..."]);
        
        const { error: sqlError } = await supabase.rpc('execute_sql', { 
          sql: `
            CREATE TABLE IF NOT EXISTS driver_profiles (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID REFERENCES auth.users(id) NOT NULL,
              email TEXT,
              full_name TEXT,
              phone TEXT,
              date_of_birth DATE,
              city TEXT,
              state TEXT,
              zip_code TEXT,
              vehicle_type TEXT,
              vehicle_make TEXT,
              vehicle_model TEXT,
              vehicle_year TEXT,
              vehicle_color TEXT,
              vehicle_plate TEXT,
              insurance_provider TEXT,
              insurance_policy TEXT,
              insurance_expiry DATE,
              onboarding_status TEXT DEFAULT 'pending',
              current_step INTEGER DEFAULT 1,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
            
            -- Add RLS policies
            ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
            
            -- Policy for users to see their own profiles
            CREATE POLICY "Users can view their own profiles"
              ON driver_profiles FOR SELECT
              USING (auth.uid() = user_id);
              
            -- Policy for users to insert their own profiles  
            CREATE POLICY "Users can insert their own profiles"
              ON driver_profiles FOR INSERT
              WITH CHECK (auth.uid() = user_id);
              
            -- Policy for users to update their own profiles
            CREATE POLICY "Users can update their own profiles"
              ON driver_profiles FOR UPDATE
              USING (auth.uid() = user_id);
          `
        });
        
        if (sqlError) {
          setLogs(prev => [...prev, `SQL Error: ${sqlError.message}`]);
        } else {
          setLogs(prev => [...prev, "Table created successfully with SQL!"]);
        }
      } else {
        setLogs(prev => [...prev, "Table created successfully!"]);
      }
      
      // Check if table exists now
      const { error: checkError } = await supabase.from('driver_profiles').select('count(*)', { head: true });
      setTableStatus(prev => ({
        ...prev,
        driver_profiles: !checkError
      }));
      
    } catch (e) {
      console.error('Error creating table:', e);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-6 w-6" />
            Supabase Configuration Debugger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex space-x-4">
            <Button onClick={runDiagnostics} disabled={loading}>
              {loading ? 'Running...' : 'Run Diagnostics'}
            </Button>
            <Button 
              variant="outline" 
              onClick={createDriverProfilesTable} 
              disabled={loading || tableStatus.driver_profiles === true}
            >
              Create driver_profiles Table
            </Button>
          </div>
          
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(tableStatus).map(([table, exists]) => (
              <Card key={table} className={`border-l-4 ${
                exists === null ? 'border-l-gray-300' : 
                exists ? 'border-l-green-500' : 'border-l-red-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Table className="h-5 w-5 mr-2 text-gray-500" />
                      <span className="font-medium">{table}</span>
                    </div>
                    {exists === null ? (
                      <span className="text-gray-500">Unknown</span>
                    ) : exists ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {tableStatus.driver_profiles === false && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Missing Required Table</AlertTitle>
              <AlertDescription>
                The driver_profiles table is missing from your Supabase database. 
                This is required for the application to function properly.
                Click the "Create driver_profiles Table" button above to create it.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-md h-96 overflow-y-auto">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className={`${log.startsWith('ERROR') ? 'text-red-400' : ''}`}>
                  &gt; {log}
                </div>
              ))
            ) : (
              <div className="text-gray-500">Run diagnostics to see output...</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugSupabase; 