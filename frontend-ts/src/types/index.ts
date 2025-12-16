export interface Location {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface LocationInput {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface Notification {
  message: string;
  type: 'success' | 'error';
}

export interface State {
  locations: Location[];
  loading: boolean;
  selectedCoords: [number, number] | null;
  selectedAddress: string | null;
  selectedName: string | null;
  saving: boolean;
  notification: Notification | null;
  focusedLocation: Location | null;
  searchKeyword: string;
}

export interface LocationsResponse {
  locations?: Location[];
}

export interface SaveLocationResponse {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface DeleteLocationResponse {
  success: boolean;
}
