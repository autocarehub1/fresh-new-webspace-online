import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, Building, Tag, Package, RotateCw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface PricingRule {
  id: string;
  clientName: string;
  clientId: string;
  ruleType: 'distance' | 'urgency' | 'package' | 'volume';
  description: string;
  baseRate: number;
  multiplier: number;
  flatFee: number;
  minimumCharge: number;
  isActive: boolean;
}

interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
  discountTier: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
}

const demoClients: Client[] = [
  {
    id: 'CLT-001',
    name: 'San Antonio Medical Center',
    email: 'billing@samc.org',
    address: '7703 Floyd Curl Dr, San Antonio, TX 78229',
    discountTier: 'gold'
  },
  {
    id: 'CLT-002',
    name: 'Methodist Hospital Labs',
    email: 'accounts@methodist.org',
    address: '4411 Medical Dr, San Antonio, TX 78229',
    discountTier: 'silver'
  },
  {
    id: 'CLT-003',
    name: 'Baptist Health Research',
    email: 'finance@baptisthealth.org',
    address: '8300 Floyd Curl Dr, San Antonio, TX 78229',
    discountTier: 'bronze'
  },
  {
    id: 'CLT-004',
    name: 'University Health System',
    email: 'ap@universityheath.org',
    address: '4502 Medical Dr, San Antonio, TX 78229',
    discountTier: 'platinum'
  },
  {
    id: 'CLT-005',
    name: 'Christus Santa Rosa Hospital',
    email: 'billing@christussantarosa.org',
    address: '2827 Babcock Rd, San Antonio, TX 78229',
    discountTier: 'none'
  }
];

const demoPricingRules: PricingRule[] = [
  {
    id: 'RULE-001',
    clientName: 'San Antonio Medical Center',
    clientId: 'CLT-001',
    ruleType: 'distance',
    description: 'Distance-based pricing for SAMC',
    baseRate: 15.00,
    multiplier: 1.2,
    flatFee: 0,
    minimumCharge: 25.00,
    isActive: true
  },
  {
    id: 'RULE-002',
    clientName: 'San Antonio Medical Center',
    clientId: 'CLT-001',
    ruleType: 'urgency',
    description: 'Urgent delivery surcharge for SAMC',
    baseRate: 0,
    multiplier: 1.5,
    flatFee: 25.00,
    minimumCharge: 25.00,
    isActive: true
  },
  {
    id: 'RULE-003',
    clientName: 'Methodist Hospital Labs',
    clientId: 'CLT-002',
    ruleType: 'package',
    description: 'Temperature-controlled package pricing',
    baseRate: 20.00,
    multiplier: 1.0,
    flatFee: 10.00,
    minimumCharge: 30.00,
    isActive: true
  },
  {
    id: 'RULE-004',
    clientName: 'University Health System',
    clientId: 'CLT-004',
    ruleType: 'volume',
    description: 'Volume discount for bulk deliveries',
    baseRate: 15.00,
    multiplier: 0.9,
    flatFee: 0,
    minimumCharge: 15.00,
    isActive: true
  }
];

export interface PricingRulesProps {}

const PricingRules = () => {
  const [clients, setClients] = useState<Client[]>(demoClients);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(demoPricingRules);
  const [clientFilter, setClientFilter] = useState<string>('');
  const [ruleTypeFilter, setRuleTypeFilter] = useState<string>('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editedRule, setEditedRule] = useState<PricingRule | null>(null);
  const [activeTab, setActiveTab] = useState('rules');
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [newRule, setNewRule] = useState<Partial<PricingRule>>({
    ruleType: 'distance',
    baseRate: 15.00,
    multiplier: 1.0,
    flatFee: 0,
    minimumCharge: 20.00,
    isActive: true
  });

  const handleEditRule = (rule: PricingRule) => {
    setIsEditing(rule.id);
    setEditedRule({ ...rule });
  };

  const handleSaveEdit = () => {
    if (!editedRule) return;
    
    setPricingRules(pricingRules.map(rule => 
      rule.id === editedRule.id ? editedRule : rule
    ));
    
    setIsEditing(null);
    setEditedRule(null);
    toast.success('Pricing rule updated successfully');
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditedRule(null);
  };

  const handleDeleteRule = (ruleId: string) => {
    setPricingRules(pricingRules.filter(rule => rule.id !== ruleId));
    toast.success('Pricing rule deleted successfully');
  };

  const handleToggleRuleStatus = (ruleId: string) => {
    setPricingRules(pricingRules.map(rule => 
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
    
    const rule = pricingRules.find(r => r.id === ruleId);
    if (rule) {
      toast.success(`Pricing rule ${rule.isActive ? 'disabled' : 'enabled'}`);
    }
  };

  const handleCreateRule = () => {
    if (!newRule.clientId) {
      toast.error('Please select a client');
      return;
    }
    
    const selectedClient = clients.find(c => c.id === newRule.clientId);
    if (!selectedClient) return;
    
    const newRuleId = `RULE-${String(pricingRules.length + 1).padStart(3, '0')}`;
    
    const createdRule: PricingRule = {
      id: newRuleId,
      clientName: selectedClient.name,
      clientId: selectedClient.id,
      ruleType: newRule.ruleType as 'distance' | 'urgency' | 'package' | 'volume',
      description: newRule.description || `${newRule.ruleType?.charAt(0).toUpperCase()}${newRule.ruleType?.slice(1)}-based pricing for ${selectedClient.name}`,
      baseRate: newRule.baseRate || 0,
      multiplier: newRule.multiplier || 1.0,
      flatFee: newRule.flatFee || 0,
      minimumCharge: newRule.minimumCharge || 0,
      isActive: newRule.isActive !== undefined ? newRule.isActive : true
    };
    
    setPricingRules([...pricingRules, createdRule]);
    setIsCreatingRule(false);
    setNewRule({
      ruleType: 'distance',
      baseRate: 15.00,
      multiplier: 1.0,
      flatFee: 0,
      minimumCharge: 20.00,
      isActive: true
    });
    
    toast.success(`Created new pricing rule: ${createdRule.description}`);
  };

  const filteredRules = pricingRules
    .filter(rule => clientFilter ? rule.clientId === clientFilter : true)
    .filter(rule => ruleTypeFilter ? rule.ruleType === ruleTypeFilter : true);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="rules">Pricing Rules</TabsTrigger>
          <TabsTrigger value="clients">Client Discounts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Client Pricing Rules</CardTitle>
                  <CardDescription>Manage custom pricing rules for clients</CardDescription>
                </div>
                <Button onClick={() => setIsCreatingRule(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Clients</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-64">
                  <Select value={ruleTypeFilter} onValueChange={setRuleTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by rule type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Rule Types</SelectItem>
                      <SelectItem value="distance">Distance-based</SelectItem>
                      <SelectItem value="urgency">Urgency-based</SelectItem>
                      <SelectItem value="package">Package-based</SelectItem>
                      <SelectItem value="volume">Volume-based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {isCreatingRule && (
                <Card className="mb-6 border-blue-200 bg-blue-50">
                  <CardHeader className="pb-2">
                    <CardTitle>Create New Pricing Rule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="client">Client</Label>
                          <Select
                            value={newRule.clientId}
                            onValueChange={(value) => setNewRule({ ...newRule, clientId: value })}
                          >
                            <SelectTrigger id="client">
                              <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                            <SelectContent>
                              {clients.map(client => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="rule-type">Rule Type</Label>
                          <Select
                            value={newRule.ruleType}
                            onValueChange={(value) => setNewRule({ 
                              ...newRule, 
                              ruleType: value as 'distance' | 'urgency' | 'package' | 'volume' 
                            })}
                          >
                            <SelectTrigger id="rule-type">
                              <SelectValue placeholder="Select rule type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="distance">Distance-based</SelectItem>
                              <SelectItem value="urgency">Urgency-based</SelectItem>
                              <SelectItem value="package">Package-based</SelectItem>
                              <SelectItem value="volume">Volume-based</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            value={newRule.description || ''}
                            onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                            placeholder="Enter rule description"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="base-rate">Base Rate ($)</Label>
                          <Input
                            id="base-rate"
                            type="number"
                            value={newRule.baseRate}
                            onChange={(e) => setNewRule({ 
                              ...newRule, 
                              baseRate: parseFloat(e.target.value) || 0 
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label className="flex justify-between">
                            <span>Multiplier: {newRule.multiplier?.toFixed(2)}x</span>
                          </Label>
                          <Slider
                            value={[newRule.multiplier || 1]}
                            min={0.5}
                            max={2}
                            step={0.05}
                            onValueChange={(values) => setNewRule({ 
                              ...newRule, 
                              multiplier: values[0] 
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="flat-fee">Flat Fee ($)</Label>
                          <Input
                            id="flat-fee"
                            type="number"
                            value={newRule.flatFee}
                            onChange={(e) => setNewRule({ 
                              ...newRule, 
                              flatFee: parseFloat(e.target.value) || 0 
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="min-charge">Minimum Charge ($)</Label>
                          <Input
                            id="min-charge"
                            type="number"
                            value={newRule.minimumCharge}
                            onChange={(e) => setNewRule({ 
                              ...newRule, 
                              minimumCharge: parseFloat(e.target.value) || 0 
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="rule-active"
                          checked={newRule.isActive}
                          onCheckedChange={(checked) => setNewRule({ ...newRule, isActive: checked })}
                        />
                        <Label htmlFor="rule-active">Rule active</Label>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsCreatingRule(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateRule}>
                          Create Rule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Rule Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Base Rate</th>
                      <th className="px-4 py-3 text-center text-sm font-medium">Multiplier</th>
                      <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRules.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          No pricing rules found. Create a new rule to get started.
                        </td>
                      </tr>
                    ) : (
                      filteredRules.map((rule) => (
                        <tr key={rule.id} className="border-t">
                          {isEditing === rule.id ? (
                            // Editing mode
                            <>
                              <td className="px-4 py-3">
                                <Select
                                  value={editedRule?.clientId}
                                  onValueChange={(value) => {
                                    const client = clients.find(c => c.id === value);
                                    if (client && editedRule) {
                                      setEditedRule({
                                        ...editedRule,
                                        clientId: value,
                                        clientName: client.name
                                      });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {clients.map(client => (
                                      <SelectItem key={client.id} value={client.id}>
                                        {client.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-4 py-3">
                                <Select
                                  value={editedRule?.ruleType}
                                  onValueChange={(value) => editedRule && setEditedRule({
                                    ...editedRule,
                                    ruleType: value as 'distance' | 'urgency' | 'package' | 'volume'
                                  })}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="distance">Distance</SelectItem>
                                    <SelectItem value="urgency">Urgency</SelectItem>
                                    <SelectItem value="package">Package</SelectItem>
                                    <SelectItem value="volume">Volume</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  value={editedRule?.description}
                                  onChange={(e) => editedRule && setEditedRule({
                                    ...editedRule,
                                    description: e.target.value
                                  })}
                                  className="h-8"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  type="number"
                                  value={editedRule?.baseRate}
                                  onChange={(e) => editedRule && setEditedRule({
                                    ...editedRule,
                                    baseRate: parseFloat(e.target.value) || 0
                                  })}
                                  className="h-8 text-right"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={editedRule?.multiplier}
                                  onChange={(e) => editedRule && setEditedRule({
                                    ...editedRule,
                                    multiplier: parseFloat(e.target.value) || 1
                                  })}
                                  className="h-8 text-center"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Switch
                                  checked={editedRule?.isActive}
                                  onCheckedChange={(checked) => editedRule && setEditedRule({
                                    ...editedRule,
                                    isActive: checked
                                  })}
                                />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button size="sm" onClick={handleSaveEdit}>
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                                    Cancel
                                  </Button>
                                </div>
                              </td>
                            </>
                          ) : (
                            // View mode
                            <>
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <Building className="h-4 w-4 mr-2 text-gray-500" />
                                  <span>{rule.clientName}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge className={`
                                  ${rule.ruleType === 'distance' ? 'bg-blue-100 text-blue-800' : ''}
                                  ${rule.ruleType === 'urgency' ? 'bg-red-100 text-red-800' : ''}
                                  ${rule.ruleType === 'package' ? 'bg-purple-100 text-purple-800' : ''}
                                  ${rule.ruleType === 'volume' ? 'bg-green-100 text-green-800' : ''}
                                `}>
                                  {rule.ruleType.charAt(0).toUpperCase() + rule.ruleType.slice(1)}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                {rule.description}
                              </td>
                              <td className="px-4 py-3 text-right">
                                ${rule.baseRate.toFixed(2)}
                                {rule.flatFee > 0 && (
                                  <div className="text-xs text-gray-500">
                                    +${rule.flatFee.toFixed(2)} fee
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Badge variant="outline">
                                  {rule.multiplier.toFixed(2)}x
                                </Badge>
                                {rule.minimumCharge > 0 && (
                                  <div className="text-xs text-gray-500">
                                    Min: ${rule.minimumCharge.toFixed(2)}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Badge className={rule.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                                }>
                                  {rule.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleRuleStatus(rule.id)}
                                  >
                                    {rule.isActive ? 'Disable' : 'Enable'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditRule(rule)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteRule(rule.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Client Discount Tiers</CardTitle>
              <CardDescription>Manage global discount tiers for clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Discount Tier</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Discount Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="font-medium">{client.name}</div>
                          <div className="text-xs text-gray-500">{client.id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{client.email}</div>
                          <div className="text-xs text-gray-500">{client.address}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={client.discountTier}
                            onValueChange={(value) => {
                              setClients(clients.map(c => 
                                c.id === client.id 
                                  ? { ...c, discountTier: value as 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' } 
                                  : c
                              ));
                              toast.success(`Updated ${client.name} discount tier to ${value}`);
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="bronze">Bronze</SelectItem>
                              <SelectItem value="silver">Silver</SelectItem>
                              <SelectItem value="gold">Gold</SelectItem>
                              <SelectItem value="platinum">Platinum</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`
                            ${client.discountTier === 'none' ? 'bg-gray-100 text-gray-800' : ''}
                            ${client.discountTier === 'bronze' ? 'bg-amber-100 text-amber-800' : ''}
                            ${client.discountTier === 'silver' ? 'bg-gray-200 text-gray-800' : ''}
                            ${client.discountTier === 'gold' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${client.discountTier === 'platinum' ? 'bg-purple-100 text-purple-800' : ''}
                          `}>
                            {client.discountTier === 'none' && '0%'}
                            {client.discountTier === 'bronze' && '5%'}
                            {client.discountTier === 'silver' && '10%'}
                            {client.discountTier === 'gold' && '15%'}
                            {client.discountTier === 'platinum' && '20%'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PricingRules; 