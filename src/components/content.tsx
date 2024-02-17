import {presets} from '@presets';
import {type Config} from '@schema';
import {useCallback, type ChangeEvent} from 'react';
import {type ModelTree, cadModelTree} from '@tree';
import {Link} from 'wouter';
import {exporter} from 'makerjs';

type ContentProps = {
  config: Config;
  tree: ModelTree;
  viewMode: 'preview' | 'cad';
  onViewModeChange: (mode: 'preview' | 'cad') => void;
};

function downloadBlob(blob: Blob, filename: string) {
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;

  // Temporarily add the anchor to the document
  document.body.append(a);

  // Trigger a click on the anchor
  a.click();

  // Remove the anchor from the document
  a.remove();

  // Release the created object URL
  URL.revokeObjectURL(url);
}

const closeClosestDetails = (event: React.MouseEvent<HTMLAnchorElement>) => {
  const element = event.target as HTMLAnchorElement;
  const details = element?.closest?.('details') as HTMLDetailsElement | undefined;
  if (details) {
    details.open = false;
  }
};

export function Content({config, tree, viewMode, onViewModeChange}: ContentProps) {
  const onDownloadConfig = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    closeClosestDetails(event);

    const blob = new Blob([JSON.stringify(config, null, 2)], {type: 'application/json'});
    downloadBlob(blob, 'config.json');
  }, [config]);

  const onDownloadDxf = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    closeClosestDetails(event);

    const cadTree = cadModelTree(tree, config);

    const dxfString = exporter.toDXF(cadTree);

    const blob = new Blob([dxfString], {type: 'application/dxf'});

    downloadBlob(blob, 'fightstick-enclosure.dxf');
  }, [tree]);

  const onToggle = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const element = event.target;
    onViewModeChange(element.checked ? 'cad' : 'preview');
  }, [onViewModeChange]);

  return (
    <div className='content-container'>
      <p>
        <b>Fightstick enclosure generator</b> is a tool to create custom fightstick enclosures. <br /><br />
        It is inspired and the fightstick version of by <a href='http://www.keyboard-layout-editor.com/' target='_blank'>Keyboard Layout Editor</a> and <a href='http://builder.swillkb.com/' target='_blank'>SwillKB Plate and Case Builder</a>. <br /><br />
        It creates DXF files for lasercutt acylic or wood. You can also download the configuration file to save or share your design. <br /><br />
        You can try different presets or start from scratch by changing the configuration in the below form.<br /><br/>
        Hover <i className='gg-info' /> next to the fields to see the description about each individual fields.
      </p>
      <div className='grid'>
        <details role='list'>
          <summary aria-haspopup='listbox' role='button'>Try Presets</summary>
          <ul role='listbox'>
            {presets.map(preset => (
              <li key={preset.id}>
                <Link href={`/preset/${preset.id}`} onClick={closeClosestDetails}>{preset.name}</Link>
              </li>
            ))}
          </ul>
        </details>
        <details role='list'>
          <summary aria-haspopup='listbox' role='button'>Download</summary>
          <ul role='listbox'>
            <li>
              <a onClick={onDownloadDxf}>CAD Files (.DXF)</a>
            </li>
            <li>
              <a onClick={onDownloadConfig}>Config (.json)</a>
            </li>
          </ul>
        </details>
        <div />
        <label >
          <span >Preview CAD Files</span>
          <input
            role='switch'
            type='checkbox'
            checked={viewMode === 'cad'}
            onChange={onToggle}
          />
        </label>
      </div>
    </div>
  );
}

