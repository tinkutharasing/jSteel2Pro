# Dynamic Field Management System

This guide explains how to use the new dynamic field management system in the jSteel2Pro app.

## Overview

The dynamic field management system allows you to:
- Add or remove fields from the weld form
- Reorder fields within categories
- Show/hide fields without removing them
- Customize field properties (labels, placeholders, validation, etc.)
- Persist field configurations across app sessions

## Components

### 1. FieldConfigService
The main service that manages field configurations. It provides methods to:
- Load field configurations
- Add/remove fields
- Update field properties
- Toggle field visibility
- Reorder fields

### 2. FieldManagementModal
A UI component that provides a user-friendly interface for managing fields. It allows users to:
- View all available fields organized by category
- Toggle field visibility
- Edit field properties
- Add new fields from available options
- Remove fields

### 3. DynamicFieldRenderer
A component that renders fields based on their configuration. It supports:
- Text fields
- Number fields
- Date fields
- Boolean fields
- Image fields
- Signature fields

## Usage

### Accessing Field Management

1. **In BulkWeldEditorScreen**: Click the settings icon (⚙️) in the top-right corner
2. **In WeldFormScreen**: Field management can be added by importing and using the FieldManagementModal component

### Managing Fields

#### Adding Fields
1. Open the Field Management modal
2. Click the "+" button in the top-right
3. Select a field from the available options
4. The field will be added to the appropriate category

#### Removing Fields
1. Open the Field Management modal
2. Find the field you want to remove
3. Click the trash icon (🗑️) next to the field
4. Confirm the removal

#### Showing/Hiding Fields
1. Open the Field Management modal
2. Toggle the switch next to any field to show/hide it
3. Hidden fields are not displayed in the form but remain in the configuration

#### Editing Field Properties
1. Open the Field Management modal
2. Click the pencil icon (✏️) next to any field
3. Edit the field properties:
   - Label: Display name for the field
   - Placeholder: Placeholder text
   - Required: Whether the field is required
   - Width: Column width as percentage

## Field Categories

### Header Fields
Fields that appear at the top of the form, typically for general information like date, welder name, location, etc.

### Table Fields
Fields that appear in the main table/grid, typically for weld-specific information like weld number, pipe size, etc.

### Footer Fields
Fields that appear at the bottom of the form, typically for additional information like sketches, signatures, etc.

## Available Field Types

- **text**: Standard text input
- **number**: Numeric input
- **date**: Date picker
- **boolean**: Yes/No toggle
- **image**: Image upload with description
- **signature**: Signature capture

## Configuration Persistence

Field configurations are automatically saved to device storage using AsyncStorage. The configuration persists across app sessions and includes:
- Field visibility settings
- Field order
- Field properties
- Custom field additions

## Default Fields

The system comes with a set of default fields that are commonly used in welding inspection forms:

### Header Fields
- Date
- Welder (weldingContractorName)
- Location (woJoNumber)

### Table Fields
- Weld # (weldNumber) - Required
- WID # (widNumber)
- Pipe Size (pipeSizeInches)
- Type (typeOfWeld)
- Cap Size (capSize)
- Passes (passes)
- WPS (wpsNumberAndTitle)
- Electrode (electrodeTypeBrand)
- RT (rt)
- HT # (htNumber)

### Footer Fields
- Weld Sketch (weldSketch)
- Sketch Description (weldSketchDescription)
- Welder Signature (welderSignature)

## Additional Available Fields

The system also includes additional fields that can be added as needed:
- Inspector Name (weldingInspectorName)
- Inspection Company (weldingInspectionCompany)
- Number of Welds Made Today (numberOfWeldsMadeToday)
- Stencil Number (stencilNumber)
- Process Used (processUsed)
- Butt (butt)
- Fillet (fillet)
- LOA/TCC Mod (loaTccMod)
- Welder Company (welderCompany)
- Welder Contractor (welderContractor)

## Technical Implementation

### Adding a New Field Type

1. Add the field type to the `FieldConfig` interface in `src/types/FieldConfig.ts`
2. Add the field type to the `DynamicFieldRenderer` component
3. Add default field configurations to `DEFAULT_FIELD_CONFIGS` or `AVAILABLE_FIELD_OPTIONS`

### Custom Validation

Fields can have custom validation by providing a `validation.custom` function in the field configuration:

```typescript
{
  id: 'customField',
  key: 'customField',
  label: 'Custom Field',
  type: 'text',
  validation: {
    custom: (value) => {
      if (value && value.length < 5) {
        return 'Field must be at least 5 characters';
      }
      return null;
    }
  }
}
```

## Troubleshooting

### Fields Not Appearing
- Check if the field is set to visible in the field management modal
- Ensure the field is in the correct category
- Verify the field key matches a property in the WeldFormData interface

### Configuration Not Saving
- Check device storage permissions
- Ensure AsyncStorage is properly installed
- Check console for error messages

### Performance Issues
- Large numbers of fields may impact performance
- Consider pagination for very large field lists
- Use efficient rendering patterns for dynamic content
