import type { ComponentType } from "react";
import AnimatedBackground from "../components/backgrounds/AnimatedBackground";
import AuroraBackground from "../components/backgrounds/AuroraBackground";
import CrossBackground from "../components/backgrounds/CrossBackground";
import ContourBackground from "../components/backgrounds/ContourBackground";
import DotBackground from "../components/backgrounds/DotBackground";
import FlowBackground from "../components/backgrounds/FlowBackground";
import MantaBackground from "../components/backgrounds/MantaBackground";
import MatrixBackground from "../components/backgrounds/MatrixBackground";
import NeedleBackground from "../components/backgrounds/NeedleBackground";
import NetworkBackground2 from "../components/backgrounds/NetworkBackground2";
import PlanktonBackground from "../components/backgrounds/PlanktonBackground";
import RidgeBackground from "../components/backgrounds/RidgeBackground";
import RingsBackground from "../components/backgrounds/RingsBackground";
import ShoalBackground from "../components/backgrounds/ShoalBackground";
import TentacleBackground from "../components/backgrounds/TentacleBackground";
import TileBackground from "../components/backgrounds/TileBackground";
import TileSpinBackground from "../components/backgrounds/TileSpinBackground";
import TriangleBackground2 from "../components/backgrounds/TriangleBackground2";
import WarpGridBackground from "../components/backgrounds/WarpGridBackground";
import FlipText from "../components/texts/FlipText";
import Button from "../components/ui/Button";
import ThemeToggle from "../components/ui/ThemeToggle";

/** Maps the `component` field from experiment frontmatter to a React component. */
export const registry: Record<string, ComponentType<any>> = {
  AnimatedBackground,
  AuroraBackground,
  CrossBackground,
  ContourBackground,
  DotBackground,
  FlowBackground,
  MantaBackground,
  MatrixBackground,
  NeedleBackground,
  NetworkBackground2,
  PlanktonBackground,
  RidgeBackground,
  RingsBackground,
  ShoalBackground,
  TentacleBackground,
  TileBackground,
  TileSpinBackground,
  TriangleBackground2,
  WarpGridBackground,
  FlipText,
  Button,
  ThemeToggle,
};

export function getComponent(id: string): ComponentType<any> | undefined {
  return registry[id];
}
