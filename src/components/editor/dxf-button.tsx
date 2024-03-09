import React, {useCallback, useRef} from 'react';
import {parseDxfFile} from '../../utils/parse-dxf';
import {type Layout} from '@schema';

type ImportDxfButtonProps = {
  onChange: (value: Layout) => void;
};

const ImportDxfButton: React.FC<ImportDxfButtonProps> = ({onChange}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    // Trigger the click event of the hidden file input
    fileInputRef.current?.click();
  };

  const onFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];

      if (file) {
        const text = await file.text();
        const dxf = await parseDxfFile(text);
        onChange(dxf);
      }
    } catch (error) {
      console.error(error);
    }
  }, [onChange]);

  return (
    <div>
      <button onClick={handleButtonClick}>Import DXF</button>
      <input
        type='file'
        ref={fileInputRef}
        style={{display: 'none'}}
        accept='.dxf'
        onChange={onFileChange}
      />
    </div>
  );
};

export default ImportDxfButton;
