import { Scanner, useDevices, centerText, boundingBox, outline } from '@yudiel/react-qr-scanner';
import { useState } from 'react';

const BarcodeScan = ({ barcode, handleBarcode }) => {
    const [tracker, setTracker] = useState('centerText'); // tracker is now a string, not an array
    const [pause, setPause] = useState(false);
    const [deviceId, setDeviceId] = useState(undefined); // define deviceId state
    const devices = useDevices();

    const styles = {
        container: {
            width: 400,
            margin: 'auto'
        },
        controls: {
            marginBottom: 8
        }
    };
    
    function getTracker() {
        switch (tracker) {
            case 'outline':
                return outline;
            case 'boundingBox':
                return boundingBox;
            case 'centerText':
                return centerText;
            default:
                return undefined;
        }
    }

    return (
        <>
            <div style={styles.container}>
                <button style={{ marginBottom: 5 }} onClick={() => setPause((val) => !val)}>
                    {pause ? 'Pause Off' : 'Pause On'}
                </button>
                <div style={styles.controls}>
                    <select onChange={(e) => setDeviceId(e.target.value)}>
                        <option value={undefined}>Select a device</option>
                        {devices.map((device, index) => (
                            <option key={index} value={device.deviceId}>
                                {device.label}
                            </option>
                        ))}
                    </select>
                    <select style={{ marginLeft: 5 }} onChange={(e) => setTracker(e.target.value)}>
                        <option value="centerText">Center Text</option>
                        <option value="outline">Outline</option>
                        <option value="boundingBox">Bounding Box</option>
                        <option value={undefined}>No Tracker</option>
                    </select>
                </div>
                <Scanner
                    onScan={(detectedCodes) => {
                        // Implement the desired onScan functionality here
                        console.log(detectedCodes[0].rawValue);
                        handleBarcode(detectedCodes[0].rawValue)
                    }}
                    formats={[
                        'qr_code',
                        'micro_qr_code',
                        'rm_qr_code',
                        'maxi_code',
                        'pdf417',
                        'aztec',
                        'data_matrix',
                        'matrix_codes',
                        'dx_film_edge',
                        'databar',
                        'databar_expanded',
                        'codabar',
                        'code_39',
                        'code_93',
                        'code_128',
                        'ean_8',
                        'ean_13',
                        'itf',
                        'linear_codes',
                        'upc_a',
                        'upc_e',
                    ]}
                    components={{
                        audio: true,
                        onOff: true,
                        torch: true,
                        zoom: true,
                        finder: true,
                        tracker: getTracker(),
                    }}
                    deviceId={deviceId} // Use deviceId here
                    scanDelay={1500}
                    allowMultiple={true}
                />
            </div>
        </>
    );
};

export default BarcodeScan;
