import type leaflet from 'leaflet';
import { useState } from 'react';
import { useMarkers } from '../../contexts/MarkersContext';
import type { FilterItem } from '../MapFilter/mapFilters';
import styles from './AddResources.module.css';
import SelectType from './SelectType';
import SelectPosition from './SelectPosition';
import DetailsInput from './DetailsInput';
import { writeError } from '../../utils/logs';
import type { MarkerDTO } from './api';
import { postMarker } from './api';
import { notify } from '../../utils/notifications';
import { getJSONItem } from '../../utils/storage';
import { defaultPosition } from '../../contexts/PositionContext';

export type Details = {
  description?: string;
  name?: string;
  level?: number;
};

type AddResourcesProps = {
  leafletMap: leaflet.Map;
  onClose: () => void;
};
function AddResources({ leafletMap, onClose }: AddResourcesProps): JSX.Element {
  const { refresh } = useMarkers();
  const [filter, setFilter] = useState<FilterItem | null>(null);
  const [details, setDetails] = useState<Details>({});
  const [location, setLocation] = useState<[number, number, number]>(() => {
    const mapPosition = getJSONItem<{
      y: number;
      x: number;
      zoom: number;
    }>('mapPosition', {
      y: defaultPosition.location[1],
      x: defaultPosition.location[0],
      zoom: 3,
    });
    return [mapPosition.x, mapPosition.y, 0];
  });

  const isValid =
    filter &&
    (filter.hasName ? details.name && details.name.length > 0 : true) &&
    (filter.hasLevel ? details.level && details.level > 0 : true);

  async function handleSave() {
    if (!isValid) {
      return;
    }
    try {
      const marker: MarkerDTO = {
        type: filter.type,
        position: location || undefined,
        ...details,
      };

      await notify(postMarker(marker), {
        success: 'Marker added 👌',
      });

      refresh();
      onClose();
    } catch (error) {
      writeError(error);
    }
  }

  return (
    <section className={styles.container}>
      <SelectPosition
        leafletMap={leafletMap}
        details={details}
        filter={filter}
        onSelectLocation={setLocation}
        location={location}
      />
      <SelectType onSelect={setFilter} filter={filter} />
      <DetailsInput filter={filter} onChange={setDetails} details={details} />
      <button
        className={styles.button}
        onClick={handleSave}
        disabled={!isValid}
      >
        Save Marker
      </button>
      <button className={styles.button} onClick={onClose}>
        Cancel
      </button>
      <small>Move marker by dragging it</small>
    </section>
  );
}

export default AddResources;
