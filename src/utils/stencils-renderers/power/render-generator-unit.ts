import { CADObject, ProjectSettings } from "../../../types/cad";
import {
  drawGeneratorBaseAndSkid,
  drawGeneratorCanopyAndDoors,
} from "./generator-render-parts";
import {
  drawGeneratorRadiator,
  drawGeneratorIntakeAndController,
  drawGeneratorSilencerAndExhaust,
  drawGeneratorDecalsAndFuel,
} from "./generator-render-equipment";

export function renderGeneratorUnit(
  ctx: CanvasRenderingContext2D,
  _obj: CADObject,
  _settings: ProjectSettings,
  w: number,
  h: number
): boolean {
  const padPad = 8;
  const skidMargin = 2;

  drawGeneratorBaseAndSkid(ctx, w, h, padPad, skidMargin);
  drawGeneratorCanopyAndDoors(ctx, w, h);
  drawGeneratorRadiator(ctx, w, h);
  drawGeneratorIntakeAndController(ctx, w, h);
  drawGeneratorSilencerAndExhaust(ctx, w, h);
  drawGeneratorDecalsAndFuel(ctx, w, h);

  return true;
}
