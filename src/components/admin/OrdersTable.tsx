                    <td className="p-2">
                      <Badge variant={
                        request.status === 'pending' ? 'outline' : 
                        request.status === 'in_progress' ? 'default' :
                        request.status === 'completed' ? 'secondary' :
                        'destructive'
                      }>
                        {request.status.replace('_', ' ')}
                      </Badge>
                      {request.status === 'pending' && 
                       request.tracking_updates?.some(update => 
                         update.status === 'Request Approved'
                       ) && (
                        <Badge variant="outline" className="ml-1 bg-amber-50 text-amber-700 border-amber-200">
                          Awaiting Driver
                        </Badge>
                      )}
                    </td> 