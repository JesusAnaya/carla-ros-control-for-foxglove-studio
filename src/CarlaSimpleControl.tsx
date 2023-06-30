import { PanelExtensionContext } from "@foxglove/studio";
import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { Slider, Checkbox, TextField } from "@fluentui/react";
import BrakeComponent from './BrakeComponent';

interface VehicleControl {
  steer: number;
  throttle: number;
  brake: number;
  reverse: boolean;
  hand_brake: boolean;
  manual_gear_shift: boolean;
  gear: number;
}

function CarlaSimpleControllPanel({ context }: { context: PanelExtensionContext }): JSX.Element {
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();

  const [vehicleControl, setVehicleControl] = useState({
    throttle: 0,
    steer: 0,
    brake: 0,
    hand_brake: false,
    reverse: false,
    manual_gear_shift: false,
    gear: 0,
  });
  
  const [steer, setSteer] = useState(0);
  const [throttle, setThrottle] = useState(0);
  const [brake, setBrake] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [customTopic, setCustomTopic] = useState("/carla/vehicle/control");
  const [recording, setRecording] = useState(false);

  const publishVehicleControl = (value: VehicleControl) => {
    setVehicleControl(value);
    context.publish?.(customTopic, vehicleControl);
  };

  const handleSteerChange = useCallback((value: number) => {
    setSteer(value);
    vehicleControl.steer = value;
    publishVehicleControl(vehicleControl);
  }, []);

  const handleThrottleChange = useCallback((value: number) => {
    setThrottle(value);
    vehicleControl.throttle = value;
    publishVehicleControl(vehicleControl);
  }, []);

  const handleReverseChange = (_ev: React.FormEvent<HTMLInputElement | HTMLElement> = {} as any, checked?: boolean) => {
    if (checked !== undefined) {
      setReverse(checked);
      vehicleControl.reverse = checked;
      publishVehicleControl(vehicleControl);
    }
  };

  const handleRecordingChange = useCallback((_ev: React.FormEvent<HTMLInputElement | HTMLElement> = {} as any, checked?: boolean) => {
    if (checked !== undefined) {
      setRecording(checked);
      context.publish?.("/ros2/service/recording", { data: checked });
    }
  }, [context]);

  useLayoutEffect(() => {
    context.onRender = (_, done) => {
      setRenderDone(() => done);
    };    

    context.watch("currentFrame");
    context.advertise?.(customTopic, "custom_interfaces/msg/VehicleControl", {
      datatypes: new Map(
        Object.entries({
          "custom_interfaces/msg/VehicleControl": { 
            definitions: [
              {name: "throttle", type: "float32"},
              {name: "steer", type: "float32"},
              {name: "brake", type: "float32"},
              {name: "hand_brake", type: "bool"},
              {name: "reverse", type: "bool"},
              {name: "manual_gear_shift", type: "bool"},
              {name: "gear", type: "int32"},
            ]
          },
        }),
      ),
    });

  }, [context, customTopic]);

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Carla Vehicle Control Panel</h2>
      <p>
        Configure the vehicle control in Carla Simulator using this custom panel.
      </p>

      <div>
        <label>Steer:</label>
        <Slider
          min={-1}
          max={1}
          step={0.02}
          value={steer}
          onChange={handleSteerChange}
        />
      </div>

      <div>
        <label>Throttle:</label>
        <Slider
          min={0}
          max={1}
          step={0.05}
          value={throttle}
          onChange={handleThrottleChange}

        />
      </div>

      <div>
        <Checkbox
          label="Reverse"
          checked={reverse}
          onChange={handleReverseChange}
        />
      </div>

      <BrakeComponent brake={brake} setBrake={setBrake} />

      <div>
        <TextField
          label="Custom Topic:"
          value={customTopic}
          onChange={(_, newValue) => setCustomTopic(newValue || "")}
        />
      </div>

      <div>
        <Checkbox
          label="Recording"
          checked={recording}
          onChange={handleRecordingChange}
        />
      </div>

    </div>
  );
}

export function initCarlaSimpleControllPanel(context: PanelExtensionContext): () => void {
  ReactDOM.render(<CarlaSimpleControllPanel context={context} />, context.panelElement);

  return () => {
    ReactDOM.unmountComponentAtNode(context.panelElement);
  };
}
