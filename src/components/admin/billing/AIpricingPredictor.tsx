import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotateCw, Zap, TrendingUp, DollarSign, Box, Calendar, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface PriceFactors {
  distance: number; // in miles
  packageType: string;
  urgency: string;
  time: string;
  volume: number;
  specialHandling: boolean;
}

// Baseline market rates for competitive analysis
const marketRates = {
  standard: {
    baseRate: 12.50,
    perMile: 1.75
  },
  temperature: {
    baseRate: 20.00,
    perMile: 2.25
  },
  urgent: {
    baseRate: 25.00,
    perMile: 2.50
  }
};

const AIpricingPredictor = () => {
  const [priceFactors, setPriceFactors] = useState<PriceFactors>({
    distance: 10,
    packageType: 'standard',
    urgency: 'normal',
    time: 'business',
    volume: 1,
    specialHandling: false
  });
  
  const [predictedPrice, setPredictedPrice] = useState<number>(45.50);
  const [competitiveAnalysis, setCompetitiveAnalysis] = useState<{low: number, high: number}>({ low: 35.25, high: 55.75 });
  const [priceBreakdown, setPriceBreakdown] = useState<{[key: string]: number}>({
    'Base Rate': 15.00,
    'Distance Cost': 18.00,
    'Package Type': 0.00,
    'Urgency Factor': 0.00,
    'Time Adjustment': 0.00,
    'Volume Discount': 0.00,
    'Special Handling': 0.00
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('single');
  const [historicalPrices, setHistoricalPrices] = useState<{date: string, price: number}[]>([
    { date: '2023-11-01', price: 42.50 },
    { date: '2023-12-01', price: 45.25 },
    { date: '2024-01-01', price: 47.00 },
    { date: '2024-02-01', price: 48.25 },
    { date: '2024-03-01', price: 49.75 },
    { date: '2024-04-01', price: 51.50 },
  ]);
  
  const [bulkPrices, setBulkPrices] = useState<{packageType: string, urgency: string, price: number}[]>([
    { packageType: 'standard', urgency: 'normal', price: 45.50 },
    { packageType: 'standard', urgency: 'same-day', price: 62.75 },
    { packageType: 'standard', urgency: 'urgent', price: 78.90 },
    { packageType: 'temperature', urgency: 'normal', price: 65.20 },
    { packageType: 'temperature', urgency: 'same-day', price: 85.75 },
    { packageType: 'temperature', urgency: 'urgent', price: 110.50 },
    { packageType: 'fragile', urgency: 'normal', price: 59.80 },
    { packageType: 'fragile', urgency: 'same-day', price: 79.25 },
    { packageType: 'fragile', urgency: 'urgent', price: 103.50 },
    { packageType: 'hazardous', urgency: 'normal', price: 75.30 },
    { packageType: 'hazardous', urgency: 'same-day', price: 98.75 },
    { packageType: 'hazardous', urgency: 'urgent', price: 130.25 }
  ]);

  // Calculation function for predicting prices
  const calculatePrice = (factors: PriceFactors) => {
    // Base pricing logic
    let baseRate = 15;
    
    // Distance factor
    const distanceCost = factors.distance * 1.80;
    
    // Package type multipliers
    let packageMultiplier = 1.0;
    if (factors.packageType === 'temperature') {
      packageMultiplier = 1.4;
    } else if (factors.packageType === 'hazardous') {
      packageMultiplier = 1.7;
    } else if (factors.packageType === 'fragile') {
      packageMultiplier = 1.3;
    }
    
    // Urgency multipliers
    let urgencyMultiplier = 1.0;
    if (factors.urgency === 'urgent') {
      urgencyMultiplier = 1.75;
    } else if (factors.urgency === 'same-day') {
      urgencyMultiplier = 1.35;
    }
    
    // Time of day/week factors
    let timeMultiplier = 1.0;
    if (factors.time === 'after-hours') {
      timeMultiplier = 1.25;
    } else if (factors.time === 'weekend') {
      timeMultiplier = 1.3;
    }
    
    // Volume discount
    let volumeMultiplier = 1.0;
    if (factors.volume > 1) {
      volumeMultiplier = Math.max(0.85, 1 - (factors.volume - 1) * 0.03);
    }
    
    // Special handling fee
    const specialHandlingFee = factors.specialHandling ? 15 : 0;
    
    // Calculate final price with "AI optimization"
    // Add a small random factor to simulate AI recommendation variations
    const randomFactor = 0.97 + Math.random() * 0.06;
    
    // Calculate base price
    const calculatedPrice = (baseRate + distanceCost) * 
      packageMultiplier * 
      urgencyMultiplier * 
      timeMultiplier * 
      volumeMultiplier + 
      specialHandlingFee;
    
    // Apply "AI optimization" and round to 2 decimal places
    const finalPrice = parseFloat((calculatedPrice * randomFactor).toFixed(2));
    
    // Calculate competitive market range
    let marketBase = marketRates.standard;
    if (factors.packageType === 'temperature') {
      marketBase = marketRates.temperature;
    }
    if (factors.urgency === 'urgent') {
      marketBase = marketRates.urgent;
    }
    
    const lowMarketPrice = parseFloat(((marketBase.baseRate + factors.distance * marketBase.perMile) * 0.9).toFixed(2));
    const highMarketPrice = parseFloat(((marketBase.baseRate + factors.distance * marketBase.perMile) * 1.2).toFixed(2));
    
    // Set price breakdown components
    const breakdown = {
      'Base Rate': parseFloat(baseRate.toFixed(2)),
      'Distance Cost': parseFloat(distanceCost.toFixed(2)),
      'Package Type': parseFloat(((baseRate + distanceCost) * packageMultiplier - (baseRate + distanceCost)).toFixed(2)),
      'Urgency Factor': parseFloat(((baseRate + distanceCost) * packageMultiplier * urgencyMultiplier - (baseRate + distanceCost) * packageMultiplier).toFixed(2)),
      'Time Adjustment': parseFloat(((baseRate + distanceCost) * packageMultiplier * urgencyMultiplier * timeMultiplier - (baseRate + distanceCost) * packageMultiplier * urgencyMultiplier).toFixed(2)),
      'Volume Discount': parseFloat(((baseRate + distanceCost) * packageMultiplier * urgencyMultiplier * timeMultiplier * volumeMultiplier - (baseRate + distanceCost) * packageMultiplier * urgencyMultiplier * timeMultiplier).toFixed(2)),
      'Special Handling': specialHandlingFee
    };

    return {
      price: finalPrice,
      competitiveAnalysis: { low: lowMarketPrice, high: highMarketPrice },
      breakdown
    };
  };

  // Auto-update price whenever factors change
  useEffect(() => {
    const result = calculatePrice(priceFactors);
    setPredictedPrice(result.price);
    setCompetitiveAnalysis(result.competitiveAnalysis);
    setPriceBreakdown(result.breakdown);
  }, [priceFactors]);

  // Generate bulk prices automatically on load and when relevant factors change
  useEffect(() => {
    generateBulkPrices();
  }, [priceFactors.distance, priceFactors.time]);
  
  // AI-based pricing prediction algorithm - now just sets loading state and calls calculatePrice
  const predictPrice = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const result = calculatePrice(priceFactors);
      setPredictedPrice(result.price);
      setCompetitiveAnalysis(result.competitiveAnalysis);
      setPriceBreakdown(result.breakdown);
      setIsLoading(false);
      
      toast.success('AI pricing prediction refreshed');
      
      // Update historical data with new prediction
      const today = new Date().toISOString().split('T')[0];
      setHistoricalPrices(prev => {
        // Only add if it's a new date
        if (!prev.find(item => item.date === today)) {
          return [...prev, { date: today, price: result.price }];
        }
        return prev;
      });
    }, 800);
  };
  
  // Generate bulk pricing for multiple package types and urgency levels
  const generateBulkPrices = () => {
    const packageTypes = ['standard', 'temperature', 'fragile', 'hazardous'];
    const urgencyLevels = ['normal', 'same-day', 'urgent'];
    
    const newBulkPrices: {packageType: string, urgency: string, price: number}[] = [];
    
    packageTypes.forEach(pkgType => {
      urgencyLevels.forEach(urgencyLevel => {
        // Create a modified price factors object for each combination
        const factors = {
          ...priceFactors,
          packageType: pkgType,
          urgency: urgencyLevel
        };
        
        const result = calculatePrice(factors);
        newBulkPrices.push({
          packageType: pkgType,
          urgency: urgencyLevel,
          price: result.price
        });
      });
    });
    
    // Update state with bulk prices
    setBulkPrices(newBulkPrices);
  };

  // Generate bulk pricing with loading indicator
  const bulkPredict = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      generateBulkPrices();
      setIsLoading(false);
      toast.success('Bulk pricing matrix refreshed');
    }, 800);
  };
  
  const getPackageTypeLabel = (type: string): string => {
    switch(type) {
      case 'standard': return 'Standard Package';
      case 'temperature': return 'Temperature Controlled';
      case 'fragile': return 'Fragile Items';
      case 'hazardous': return 'Hazardous Materials';
      default: return type;
    }
  };
  
  const getUrgencyLabel = (urgency: string): string => {
    switch(urgency) {
      case 'normal': return 'Standard Delivery';
      case 'same-day': return 'Same-Day Delivery';
      case 'urgent': return 'Urgent (2-Hour)';
      default: return urgency;
    }
  };
  
  const getPriceRating = (): string => {
    if (!competitiveAnalysis) return '';
    
    const midPoint = (competitiveAnalysis.low + competitiveAnalysis.high) / 2;
    
    if (predictedPrice < competitiveAnalysis.low) {
      return 'below-market';
    } else if (predictedPrice > competitiveAnalysis.high) {
      return 'premium';
    } else if (predictedPrice < midPoint) {
      return 'competitive';
    } else {
      return 'high-competitive';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <Zap className="h-6 w-6 text-blue-500 mr-2" />
                AI Pricing Predictor
              </CardTitle>
              <CardDescription>
                Generate optimal pricing for your medical courier services using AI
              </CardDescription>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single Delivery</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Pricing</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent>
          {activeTab === 'single' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Delivery Parameters</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="distance" className="flex justify-between">
                      <span>Distance (miles): {priceFactors.distance}</span>
                    </Label>
                    <Slider
                      id="distance"
                      value={[priceFactors.distance]}
                      min={1}
                      max={50}
                      step={1}
                      onValueChange={(values) => setPriceFactors({ 
                        ...priceFactors, 
                        distance: values[0] 
                      })}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="package-type">Package Type</Label>
                    <Select
                      value={priceFactors.packageType}
                      onValueChange={(value) => setPriceFactors({ 
                        ...priceFactors, 
                        packageType: value 
                      })}
                    >
                      <SelectTrigger id="package-type" className="mt-1">
                        <SelectValue placeholder="Select package type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard Package</SelectItem>
                        <SelectItem value="temperature">Temperature Controlled</SelectItem>
                        <SelectItem value="fragile">Fragile Items</SelectItem>
                        <SelectItem value="hazardous">Hazardous Materials</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select
                      value={priceFactors.urgency}
                      onValueChange={(value) => setPriceFactors({ 
                        ...priceFactors, 
                        urgency: value 
                      })}
                    >
                      <SelectTrigger id="urgency" className="mt-1">
                        <SelectValue placeholder="Select urgency level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Standard Delivery</SelectItem>
                        <SelectItem value="same-day">Same-Day Delivery</SelectItem>
                        <SelectItem value="urgent">Urgent (2-Hour)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="time">Time of Service</Label>
                    <Select
                      value={priceFactors.time}
                      onValueChange={(value) => setPriceFactors({ 
                        ...priceFactors, 
                        time: value 
                      })}
                    >
                      <SelectTrigger id="time" className="mt-1">
                        <SelectValue placeholder="Select service time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Business Hours</SelectItem>
                        <SelectItem value="after-hours">After Hours</SelectItem>
                        <SelectItem value="weekend">Weekend/Holiday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="volume" className="flex justify-between">
                      <span>Volume (packages): {priceFactors.volume}</span>
                    </Label>
                    <Slider
                      id="volume"
                      value={[priceFactors.volume]}
                      min={1}
                      max={20}
                      step={1}
                      onValueChange={(values) => setPriceFactors({ 
                        ...priceFactors, 
                        volume: values[0] 
                      })}
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="special-handling"
                      checked={priceFactors.specialHandling}
                      onChange={(e) => setPriceFactors({
                        ...priceFactors,
                        specialHandling: e.target.checked
                      })}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <Label htmlFor="special-handling" className="cursor-pointer">
                      Special Handling Required
                    </Label>
                  </div>
                  
                  <Button 
                    onClick={predictPrice} 
                    className="w-full mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Refresh AI Price Prediction
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Price recommendation - always show this section */}
                <h3 className="text-lg font-medium">AI Price Recommendation</h3>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      ${predictedPrice.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Recommended price based on AI analysis
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-blue-100">
                    <div className="text-sm text-gray-500 mb-2">Market Price Range:</div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">${competitiveAnalysis.low.toFixed(2)}</span>
                      <div className="h-2 flex-1 bg-gray-200 mx-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            getPriceRating() === 'below-market' ? 'bg-green-400' : 
                            getPriceRating() === 'competitive' ? 'bg-blue-400' :
                            getPriceRating() === 'high-competitive' ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`}
                          style={{ 
                            width: `${Math.min(100, Math.max(0, ((predictedPrice - competitiveAnalysis.low) / (competitiveAnalysis.high - competitiveAnalysis.low)) * 100))}%` 
                          }}
                        />
                      </div>
                      <span className="text-gray-600">${competitiveAnalysis.high.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-center mt-1 text-gray-500">
                      {getPriceRating() === 'below-market' && 'Below market average - consider raising your price'}
                      {getPriceRating() === 'competitive' && 'Competitive price - good market position'}
                      {getPriceRating() === 'high-competitive' && 'Upper market range - competitive but premium'}
                      {getPriceRating() === 'premium' && 'Premium pricing - ensure your service quality justifies this rate'}
                    </div>
                  </div>
                </div>
                
                {/* Price breakdown - always show */}
                <div className="border rounded-md">
                  <div className="bg-muted px-4 py-2 border-b">
                    <h4 className="font-medium">Price Breakdown</h4>
                  </div>
                  <div className="p-4 space-y-2">
                    {Object.entries(priceBreakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600">{key}</span>
                        <span className={value < 0 ? 'text-green-600' : 'text-gray-900'}>
                          {value < 0 ? '-' : ''}${Math.abs(value).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 mt-2 border-t flex justify-between font-medium">
                      <span>Total Price</span>
                      <span>${predictedPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'bulk' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Bulk Pricing Parameters</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bulk-distance" className="flex justify-between">
                        <span>Distance (miles): {priceFactors.distance}</span>
                      </Label>
                      <Slider
                        id="bulk-distance"
                        value={[priceFactors.distance]}
                        min={1}
                        max={50}
                        step={1}
                        onValueChange={(values) => setPriceFactors({ 
                          ...priceFactors, 
                          distance: values[0] 
                        })}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bulk-time">Time of Service</Label>
                      <Select
                        value={priceFactors.time}
                        onValueChange={(value) => setPriceFactors({ 
                          ...priceFactors, 
                          time: value 
                        })}
                      >
                        <SelectTrigger id="bulk-time" className="mt-1">
                          <SelectValue placeholder="Select service time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="business">Business Hours</SelectItem>
                          <SelectItem value="after-hours">After Hours</SelectItem>
                          <SelectItem value="weekend">Weekend/Holiday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      onClick={bulkPredict} 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                          Refreshing Bulk Pricing...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Refresh Bulk Pricing Matrix
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Pricing Matrix</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bulkPrices.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm text-gray-900">{getPackageTypeLabel(item.packageType)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{getUrgencyLabel(item.urgency)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">${item.price.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIpricingPredictor; 