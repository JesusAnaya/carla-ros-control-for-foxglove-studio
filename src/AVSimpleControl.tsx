import { PanelExtensionContext } from "@foxglove/studio";
import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { Slider, Checkbox, TextField } from "@fluentui/react";
import BrakeComponent from './BrakeComponent';

interface EgoControl {
  steer: number;
  speed: number;
  brake: number;
  reverse: boolean;
}

function AVSimpleControllPanel({ context }: { context: PanelExtensionContext }): JSX.Element {
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();

  const [EgoControl, setEgoControl] = useState({
    speed: 0,
    steer: 0,
    brake: 0,
    reverse: false,
  });
  
  const [steer, setSteer] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [brake, setBrake] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [customTopic, setCustomTopic] = useState("/av/ego/control");
  const [recording, setRecording] = useState(false);

  const publishEgoControl = (value: EgoControl) => {
    setEgoControl(value);
    context.publish?.(customTopic, EgoControl);
  };

  const handleSteerChange = useCallback((value: number) => {
    setSteer(value);
    EgoControl.steer = value;
    publishEgoControl(EgoControl);
  }, []);

  const handleSpeedChange = useCallback((value: number) => {
    setSpeed(value);
    EgoControl.speed = value;
    publishEgoControl(EgoControl);
  }, []);

  const handleReverseChange = (_ev: React.FormEvent<HTMLInputElement | HTMLElement> = {} as any, checked?: boolean) => {
    if (checked !== undefined) {
      setReverse(checked);
      EgoControl.reverse = checked;
      publishEgoControl(EgoControl);
    }
  };

  const handleRecordingChange = useCallback((_ev: React.FormEvent<HTMLInputElement | HTMLElement> = {} as any, checked?: boolean) => {
    if (checked !== undefined) {
      setRecording(checked);
      context.publish?.("/carla-bridge/recording", { data: checked });
    }
  }, [context]);

  useLayoutEffect(() => {
    context.onRender = (_, done) => {
      setRenderDone(() => done);
    };    

    context.watch("currentFrame");
    context.advertise?.(customTopic, "carla_ros_interfaces/msg/EgoVehicleControl", {
      datatypes: new Map(
        Object.entries({
          "carla_ros_interfaces/msg/EgoVehicleControl": { 
            definitions: [
              {name: "speed", type: "float32"},
              {name: "steer", type: "float32"},
              {name: "brake", type: "float32"},
              {name: "reverse", type: "bool"},
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
      <h2>Autonomous Vehicle Control Panel</h2>
      <p>
        Configure the vehicle control using this custom panel.
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
        <label>Velocity Km/h:</label>
        <Slider
          min={0}
          max={50}
          step={0.5}
          value={speed}
          onChange={handleSpeedChange}

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

export function initAVSimpleControllPanel(context: PanelExtensionContext): () => void {
  ReactDOM.render(<AVSimpleControllPanel context={context} />, context.panelElement);

  return () => {
    ReactDOM.unmountComponentAtNode(context.panelElement);
  };
}
