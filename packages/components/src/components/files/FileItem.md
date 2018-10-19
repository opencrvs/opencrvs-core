An item in a list of files. Pass it a file object and callbacks to handle `onDelete` and `onPreview` click events when the corresponding button is clicked.

```jsx
<FileItem
  file={{ subject: 'Mother', type: 'Birth registration', data: '' }}
  onDelete={() => alert('onDelete called')}
  onPreview={() => alert('onPreview called')}
/>
<FileItem
  file={{ subject: 'Father', type: 'Passport', data: '' }}
  onDelete={() => alert('onDelete called')}
  onPreview={() => alert('onPreview called')}
/>
```
