import type { ComponentType } from 'react';
import { useShowMarkers } from '@interaktivgmbh/volto-accessibility-checker/hooks/useShowMarkers/useShowMarkers';

const withBlockMarker = (View: ComponentType<any>) => {
  return (props: any) => {
    const isMarkerVisible = useShowMarkers();

    return (
      <>
        {isMarkerVisible && <template data-block-uuid={props.id} />}
        <View {...props} />
      </>
    );
  };
};

export default withBlockMarker;
