import AsyncStorage from '@react-native-async-storage/async-storage';
import { FieldConfig, FormFieldConfig, DEFAULT_FIELD_CONFIGS } from '../types/FieldConfig';

const FIELD_CONFIG_KEY = 'weld_form_field_config';
const DEFAULT_CONFIG_VERSION = '1.0.0';

class FieldConfigService {
  private static instance: FieldConfigService;
  private config: FormFieldConfig | null = null;

  private constructor() {}

  public static getInstance(): FieldConfigService {
    if (!FieldConfigService.instance) {
      FieldConfigService.instance = new FieldConfigService();
    }
    return FieldConfigService.instance;
  }

  /**
   * Initialize the field configuration service
   */
  public async initialize(): Promise<void> {
    try {
      const storedConfig = await AsyncStorage.getItem(FIELD_CONFIG_KEY);
      if (storedConfig) {
        this.config = JSON.parse(storedConfig);
        console.log('=== FIELD CONFIG LOADED FROM STORAGE ===');
        console.log('Config:', this.config);
        console.log('Table fields:', this.config.categories.find(cat => cat.id === 'table')?.fields.map(f => ({ key: f.key, label: f.label })));
      } else {
        // Initialize with default configuration
        this.config = this.createDefaultConfig();
        await this.saveConfig();
        console.log('Field config initialized with defaults');
      }
    } catch (error) {
      console.error('Error initializing field config:', error);
      // Fallback to default configuration
      this.config = this.createDefaultConfig();
    }
  }

  /**
   * Get the current field configuration
   */
  public getConfig(): FormFieldConfig {
    if (!this.config) {
      this.config = this.createDefaultConfig();
    }
    return this.config;
  }

  /**
   * Get visible fields for a specific category
   */
  public getVisibleFields(category: 'header' | 'table' | 'footer'): FieldConfig[] {
    const config = this.getConfig();
    const categoryConfig = config.categories.find(cat => cat.id === category);
    if (!categoryConfig) {
      console.log(`No category found for: ${category}`);
      return [];
    }
    
    const visibleFields = categoryConfig.fields
      .filter(field => field.visible)
      .sort((a, b) => a.order - b.order);
    
    console.log(`=== GET VISIBLE FIELDS FOR ${category.toUpperCase()} ===`);
    console.log(`Total fields in category: ${categoryConfig.fields.length}`);
    console.log(`Visible fields: ${visibleFields.length}`);
    console.log('Fields:', visibleFields.map(f => ({ key: f.key, label: f.label, order: f.order })));
    
    return visibleFields;
  }

  /**
   * Get all available fields (visible and hidden)
   */
  public getAllFields(): FieldConfig[] {
    const config = this.getConfig();
    return config.categories.flatMap(category => category.fields);
  }

  /**
   * Generate a new field with unique ID
   */
  public generateNewField(label: string, key: string, category: 'header' | 'table' | 'footer'): FieldConfig {
    const uniqueId = this.generateUniqueFieldId(key);
    const maxOrder = this.getMaxOrderForCategory(category);
    
    return {
      id: uniqueId,
      key: key,
      label: label,
      placeholder: `Enter ${label.toLowerCase()}`,
      required: false,
      visible: true,
      order: maxOrder + 1,
      category: category,
      width: category === 'table' ? 0.12 : 0.2,
    };
  }

  /**
   * Get the maximum order for a category
   */
  private getMaxOrderForCategory(category: 'header' | 'table' | 'footer'): number {
    const config = this.getConfig();
    const categoryConfig = config.categories.find(cat => cat.id === category);
    if (!categoryConfig) {
      return 0;
    }
    return Math.max(...categoryConfig.fields.map(f => f.order), 0);
  }

  /**
   * Add a new field to the configuration
   */
  public async addField(fieldConfig: FieldConfig): Promise<void> {
    const config = this.getConfig();
    const category = config.categories.find(cat => cat.id === fieldConfig.category);
    
    if (!category) {
      throw new Error(`Category ${fieldConfig.category} not found`);
    }

    // Check if field with same key already exists in this category
    const existingField = category.fields.find(field => field.key === fieldConfig.key);
    if (existingField) {
      throw new Error(`Field with key '${fieldConfig.key}' already exists in ${fieldConfig.category} category`);
    }

    // Generate unique ID if not provided or if it already exists
    let uniqueId = fieldConfig.id;
    if (!uniqueId || this.fieldIdExists(uniqueId)) {
      uniqueId = this.generateUniqueFieldId(fieldConfig.key);
    }

    // Set the order to be at the end of the category
    const maxOrder = Math.max(...category.fields.map(f => f.order), 0);
    
    const newField: FieldConfig = {
      ...fieldConfig,
      id: uniqueId,
      order: maxOrder + 1,
      visible: true,
    };

    category.fields.push(newField);
    config.lastUpdated = new Date().toISOString();
    
    await this.saveConfig();
  }

  /**
   * Remove a field from the configuration
   */
  public async removeField(fieldId: string): Promise<void> {
    const config = this.getConfig();
    
    for (const category of config.categories) {
      const fieldIndex = category.fields.findIndex(field => field.id === fieldId);
      if (fieldIndex !== -1) {
        category.fields.splice(fieldIndex, 1);
        break;
      }
    }
    
    config.lastUpdated = new Date().toISOString();
    await this.saveConfig();
  }

  /**
   * Update field visibility
   */
  public async setFieldVisibility(fieldId: string, visible: boolean): Promise<void> {
    const config = this.getConfig();
    const field = this.findFieldById(fieldId);
    
    if (field) {
      field.visible = visible;
      config.lastUpdated = new Date().toISOString();
      await this.saveConfig();
    }
  }

  /**
   * Update field properties
   */
  public async updateField(fieldId: string, updates: Partial<FieldConfig>): Promise<void> {
    const config = this.getConfig();
    const field = this.findFieldById(fieldId);
    
    if (field) {
      Object.assign(field, updates);
      config.lastUpdated = new Date().toISOString();
      await this.saveConfig();
    }
  }

  /**
   * Reorder fields within a category
   */
  public async reorderFields(categoryId: string, fieldIds: string[]): Promise<void> {
    const config = this.getConfig();
    const category = config.categories.find(cat => cat.id === categoryId);
    
    if (!category) {
      throw new Error(`Category ${categoryId} not found`);
    }

    // Reorder fields based on the provided order
    const reorderedFields: FieldConfig[] = [];
    for (let i = 0; i < fieldIds.length; i++) {
      const field = category.fields.find(f => f.id === fieldIds[i]);
      if (field) {
        field.order = i + 1;
        reorderedFields.push(field);
      }
    }

    // Add any remaining fields that weren't in the reorder list
    const reorderedFieldIds = new Set(fieldIds);
    const remainingFields = category.fields.filter(f => !reorderedFieldIds.has(f.id));
    remainingFields.forEach(field => {
      field.order = reorderedFields.length + 1;
      reorderedFields.push(field);
    });

    category.fields = reorderedFields;
    config.lastUpdated = new Date().toISOString();
    await this.saveConfig();
  }

  /**
   * Reset configuration to defaults
   */
  public async resetToDefaults(): Promise<void> {
    this.config = this.createDefaultConfig();
    await this.saveConfig();
  }

  /**
   * Find a field by its ID
   */
  private findFieldById(fieldId: string): FieldConfig | null {
    const config = this.getConfig();
    for (const category of config.categories) {
      const field = category.fields.find(f => f.id === fieldId);
      if (field) {
        return field;
      }
    }
    return null;
  }

  /**
   * Check if a field ID already exists
   */
  private fieldIdExists(fieldId: string): boolean {
    return this.findFieldById(fieldId) !== null;
  }

  /**
   * Generate a unique field ID based on the field key
   */
  private generateUniqueFieldId(fieldKey: string): string {
    const baseId = fieldKey;
    let counter = 1;
    let uniqueId = baseId;
    
    while (this.fieldIdExists(uniqueId)) {
      uniqueId = `${baseId}_${counter}`;
      counter++;
    }
    
    return uniqueId;
  }

  /**
   * Create default configuration
   */
  private createDefaultConfig(): FormFieldConfig {
    const headerFields = DEFAULT_FIELD_CONFIGS.filter(f => f.category === 'header');
    const tableFields = DEFAULT_FIELD_CONFIGS.filter(f => f.category === 'table');
    const footerFields = DEFAULT_FIELD_CONFIGS.filter(f => f.category === 'footer');

    return {
      categories: [
        {
          id: 'header',
          name: 'Header Fields',
          fields: headerFields,
          order: 1,
        },
        {
          id: 'table',
          name: 'Table Fields',
          fields: tableFields,
          order: 2,
        },
        {
          id: 'footer',
          name: 'Footer Fields',
          fields: footerFields,
          order: 3,
        },
      ],
      version: DEFAULT_CONFIG_VERSION,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Save configuration to storage
   */
  private async saveConfig(): Promise<void> {
    if (!this.config) {
      throw new Error('No configuration to save');
    }
    
    try {
      await AsyncStorage.setItem(FIELD_CONFIG_KEY, JSON.stringify(this.config));
      console.log('Field config saved to storage');
    } catch (error) {
      console.error('Error saving field config:', error);
      throw error;
    }
  }

  /**
   * Validate field value based on field configuration
   */
  public validateFieldValue(field: FieldConfig, value: any): string | null {
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label} is required`;
    }

    if (!value || value === '') {
      return null; // No validation needed for empty optional fields
    }

    const validation = field.validation;
    if (!validation) {
      return null;
    }

    if (validation.minLength && typeof value === 'string' && value.length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`;
    }

    if (validation.maxLength && typeof value === 'string' && value.length > validation.maxLength) {
      return `${field.label} must be no more than ${validation.maxLength} characters`;
    }

    if (validation.pattern && typeof value === 'string' && !new RegExp(validation.pattern).test(value)) {
      return `${field.label} format is invalid`;
    }

    if (validation.custom) {
      return validation.custom(value);
    }

    return null;
  }

  /**
   * Get field configuration by key
   */
  public getFieldByKey(key: string): FieldConfig | null {
    const config = this.getConfig();
    for (const category of config.categories) {
      const field = category.fields.find(f => f.key === key);
      if (field) {
        return field;
      }
    }
    return null;
  }
}

export default FieldConfigService;
