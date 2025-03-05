
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/supabase';
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, XIcon, ClockIcon, RefreshCw } from 'lucide-react';

const QueueMonitor = () => {
  const { session } = useSupabaseAuth();
  const [queueItems, setQueueItems] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue');

  const loadData = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    
    try {
      // Fetch queue items
      const { data: queueData, error: queueError } = await supabase
        .from('image_generation_queue')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
        
      if (queueError) throw queueError;
      setQueueItems(queueData || []);
      
      // Fetch results
      const { data: resultsData, error: resultsError } = await supabase
        .from('image_generation_results')
        .select(`
          *,
          queue:queue_id(
            prompt,
            model,
            status,
            user_id
          )
        `)
        .filter('queue.user_id', 'eq', session.user.id)
        .order('created_at', { ascending: false });
        
      if (resultsError) throw resultsError;
      setResults(resultsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
    
    // Subscribe to queue updates
    const channel = supabase
      .channel('queue-monitor')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'image_generation_queue',
        filter: `user_id=eq.${session?.user?.id}`
      }, () => loadData())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'image_generation_results',
        filter: `id=neq.00000000-0000-0000-0000-000000000000` // any row
      }, () => loadData())
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Failed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckIcon className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XIcon className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <XIcon className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };
  
  if (!session) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your generation queue</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Image Generation Queue Monitor</CardTitle>
              <CardDescription>Track the status of your image generation requests</CardDescription>
            </div>
            <Button onClick={loadData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="queue">Queue Items</TabsTrigger>
              <TabsTrigger value="results">Generation Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="queue">
              {loading ? (
                <div className="text-center py-8">Loading queue items...</div>
              ) : queueItems.length === 0 ? (
                <div className="text-center py-8">No queue items found</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Prompt</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Seed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queueItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(item.status)}
                              {getStatusBadge(item.status)}
                            </div>
                            {item.error_message && (
                              <span className="text-xs text-red-500 block mt-1">
                                {item.error_message}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{item.prompt}</TableCell>
                          <TableCell>{item.model}</TableCell>
                          <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                          <TableCell>{item.width}×{item.height}</TableCell>
                          <TableCell>{item.seed}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="results">
              {loading ? (
                <div className="text-center py-8">Loading results...</div>
              ) : results.length === 0 ? (
                <div className="text-center py-8">No results found</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map(result => (
                    <Card key={result.id}>
                      <div className="aspect-square overflow-hidden">
                        <img 
                          src={result.image_url} 
                          alt={result.queue?.prompt || 'Generated image'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm truncate">
                          {result.queue?.prompt || 'Generated image'}
                        </CardTitle>
                      </CardHeader>
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <div className="text-xs text-muted-foreground">
                          {new Date(result.created_at).toLocaleString()}
                        </div>
                        <div>
                          {getStatusBadge(result.queue?.status || 'unknown')}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueueMonitor;
