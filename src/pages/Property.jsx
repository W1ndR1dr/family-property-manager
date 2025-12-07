import React, { useState, useEffect } from "react";
import { Property } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar as CalendarIcon,
  Save,
  Plus,
  Pencil,
  Trash2,
  Home,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";

const PROPERTY_TYPES = [
  { value: "single_family", label: "Single Family Home" },
  { value: "multi_family", label: "Multi-Family (2-4 units)" },
  { value: "apartment", label: "Apartment Building (5+ units)" },
  { value: "condo", label: "Condo/Townhouse" },
  { value: "commercial", label: "Commercial" },
  { value: "mixed_use", label: "Mixed Use" },
];

export default function PropertyPage() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "CA",
    zip: "",
    property_type: "",
    year_built: "",
    num_units: 1,
    purchase_date: null,
    purchase_price: "",
    cost_basis: "",
    current_value: "",
    notes: ""
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setIsLoading(true);
    try {
      const data = await Property.list('-created_date');
      setProperties(data);
    } catch (error) {
      console.error("Error loading properties:", error);
    }
    setIsLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        cost_basis: parseFloat(formData.cost_basis) || parseFloat(formData.purchase_price) || 0,
        current_value: parseFloat(formData.current_value) || 0,
        num_units: parseInt(formData.num_units) || 1,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
      };

      if (editingProperty) {
        await Property.update(editingProperty.id, dataToSave);
      } else {
        await Property.create(dataToSave);
      }

      setShowForm(false);
      setEditingProperty(null);
      resetForm();
      loadProperties();
    } catch (error) {
      console.error("Error saving property:", error);
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      name: property.name || "",
      address: property.address || "",
      city: property.city || "",
      state: property.state || "CA",
      zip: property.zip || "",
      property_type: property.property_type || "",
      year_built: property.year_built || "",
      num_units: property.num_units || 1,
      purchase_date: property.purchase_date ? new Date(property.purchase_date) : null,
      purchase_price: property.purchase_price || "",
      cost_basis: property.cost_basis || "",
      current_value: property.current_value || "",
      notes: property.notes || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await Property.delete(id);
        loadProperties();
      } catch (error) {
        console.error("Error deleting property:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "CA",
      zip: "",
      property_type: "",
      year_built: "",
      num_units: 1,
      purchase_date: null,
      purchase_price: "",
      cost_basis: "",
      current_value: "",
      notes: ""
    });
  };

  const calculateAppreciation = (property) => {
    if (!property.purchase_price || !property.current_value) return null;
    const appreciation = ((property.current_value - property.purchase_price) / property.purchase_price) * 100;
    return appreciation;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Property Details</h1>
              <p className="text-slate-600">Manage your real estate properties and track values</p>
            </div>
            <Button
              onClick={() => {
                setShowForm(!showForm);
                setEditingProperty(null);
                resetForm();
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>

          {/* Property Form */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingProperty ? 'Edit Property' : 'Add New Property'}</CardTitle>
                <CardDescription>Enter the property details for tax and tracking purposes</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Property Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g., F Street Property"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="property_type">Property Type</Label>
                      <Select
                        value={formData.property_type}
                        onValueChange={(value) => handleInputChange('property_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROPERTY_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-slate-900">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Street Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          placeholder="123 Main Street"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="Sacramento"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            placeholder="CA"
                            maxLength={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zip">ZIP Code</Label>
                          <Input
                            id="zip"
                            value={formData.zip}
                            onChange={(e) => handleInputChange('zip', e.target.value)}
                            placeholder="95814"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-slate-900">Property Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="year_built">Year Built</Label>
                        <Input
                          id="year_built"
                          type="number"
                          value={formData.year_built}
                          onChange={(e) => handleInputChange('year_built', e.target.value)}
                          placeholder="1985"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="num_units">Number of Units</Label>
                        <Input
                          id="num_units"
                          type="number"
                          min="1"
                          value={formData.num_units}
                          onChange={(e) => handleInputChange('num_units', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="purchase_date">Purchase Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.purchase_date
                                ? format(formData.purchase_date, 'PPP')
                                : 'Select date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.purchase_date}
                              onSelect={(date) => handleInputChange('purchase_date', date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-slate-900">Financial Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="purchase_price">Purchase Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id="purchase_price"
                            type="number"
                            className="pl-9"
                            value={formData.purchase_price}
                            onChange={(e) => handleInputChange('purchase_price', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cost_basis">Cost Basis (for depreciation)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id="cost_basis"
                            type="number"
                            className="pl-9"
                            value={formData.cost_basis}
                            onChange={(e) => handleInputChange('cost_basis', e.target.value)}
                            placeholder="Usually purchase price"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="current_value">Current Estimated Value</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id="current_value"
                            type="number"
                            className="pl-9"
                            value={formData.current_value}
                            onChange={(e) => handleInputChange('current_value', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Additional details about the property..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => {
                      setShowForm(false);
                      setEditingProperty(null);
                      resetForm();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      <Save className="w-4 h-4 mr-2" />
                      {editingProperty ? 'Update' : 'Save'} Property
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Property List */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6">
              {[1, 2].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Properties Added</h3>
                <p className="text-slate-600 mb-6">Add your first property to start tracking.</p>
                <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Property
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {properties.map(property => {
                const appreciation = calculateAppreciation(property);
                const propertyType = PROPERTY_TYPES.find(t => t.value === property.property_type);

                return (
                  <Card key={property.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        {/* Property Info */}
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Home className="w-5 h-5 text-blue-600" />
                                {property.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 text-slate-600">
                                <MapPin className="w-4 h-4" />
                                <span>
                                  {property.address}, {property.city}, {property.state} {property.zip}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(property)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500"
                                onClick={() => handleDelete(property.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {propertyType && (
                              <Badge variant="outline">{propertyType.label}</Badge>
                            )}
                            {property.num_units > 1 && (
                              <Badge variant="outline">{property.num_units} units</Badge>
                            )}
                            {property.year_built && (
                              <Badge variant="outline">Built {property.year_built}</Badge>
                            )}
                          </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                          <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <div className="text-sm text-slate-600 mb-1">Purchase Price</div>
                            <div className="text-lg font-bold text-slate-900">
                              ${property.purchase_price?.toLocaleString() || '—'}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <div className="text-sm text-slate-600 mb-1">Cost Basis</div>
                            <div className="text-lg font-bold text-slate-900">
                              ${property.cost_basis?.toLocaleString() || '—'}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <div className="text-sm text-slate-600 mb-1">Current Value</div>
                            <div className="text-lg font-bold text-slate-900">
                              ${property.current_value?.toLocaleString() || '—'}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <div className="text-sm text-slate-600 mb-1">Appreciation</div>
                            <div className={`text-lg font-bold flex items-center justify-center gap-1 ${
                              appreciation > 0 ? 'text-green-600' : appreciation < 0 ? 'text-red-600' : 'text-slate-900'
                            }`}>
                              {appreciation !== null ? (
                                <>
                                  <TrendingUp className="w-4 h-4" />
                                  {appreciation.toFixed(1)}%
                                </>
                              ) : '—'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {property.notes && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-slate-600">{property.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
