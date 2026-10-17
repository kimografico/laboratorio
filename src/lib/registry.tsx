import type { ComponentType } from "react";
import AnimatedBackground from "../components/backgrounds/AnimatedBackground";
import AuroraBackground from "../components/backgrounds/AuroraBackground";
import BlobBackground from "../components/backgrounds/BlobBackground";
import BubbleBackground from "../components/backgrounds/BubbleBackground";
import ChladniBackground from "../components/backgrounds/ChladniBackground";
import CircuitBackground from "../components/backgrounds/CircuitBackground";
import ClothBackground from "../components/backgrounds/ClothBackground";
import ContourBackground from "../components/backgrounds/ContourBackground";
import Contour2Background from "../components/backgrounds/Contour2Background";
import Contour3Background from "../components/backgrounds/Contour3Background";
import CoralBackground from "../components/backgrounds/CoralBackground";
import CrossBackground from "../components/backgrounds/CrossBackground";
import DandelionBackground from "../components/backgrounds/DandelionBackground";
import DitherBackground from "../components/backgrounds/DitherBackground";
import DotBackground from "../components/backgrounds/DotBackground";
import FacetBackground from "../components/backgrounds/FacetBackground";
import FieldLinesBackground from "../components/backgrounds/FieldLinesBackground";
import FirefliesBackground from "../components/backgrounds/FirefliesBackground";
import FlatCausticsBackground from "../components/backgrounds/FlatCausticsBackground";
import FlowBackground from "../components/backgrounds/FlowBackground";
import FogBackground from "../components/backgrounds/FogBackground";
import GlobeBackground from "../components/backgrounds/GlobeBackground";
import IsoBackground from "../components/backgrounds/IsoBackground";
import JellyBackground from "../components/backgrounds/JellyBackground";
import KelpBackground from "../components/backgrounds/KelpBackground";
import KoiBackground from "../components/backgrounds/KoiBackground";
import KoiBackgroundII from "../components/backgrounds/KoiBackgroundII";
import LavaLampBackground from "../components/backgrounds/LavaLampBackground";
import LeavesBackground from "../components/backgrounds/LeavesBackground";
import LifeBackground from "../components/backgrounds/LifeBackground";
import LilyBackground from "../components/backgrounds/LilyBackground";
import LissajousBackground from "../components/backgrounds/LissajousBackground";
import MantaBackground from "../components/backgrounds/MantaBackground";
import MatrixBackground from "../components/backgrounds/MatrixBackground";
import MoireBackground from "../components/backgrounds/MoireBackground";
import NeedleBackground from "../components/backgrounds/NeedleBackground";
import NetworkBackground2 from "../components/backgrounds/NetworkBackground2";
import OrbitBackground from "../components/backgrounds/OrbitBackground";
import PendulumWaveBackground from "../components/backgrounds/PendulumWaveBackground";
import PhysarumBackground from "../components/backgrounds/PhysarumBackground";
import PlanetsBackground from "../components/backgrounds/PlanetsBackground";
import PlanetsOrbitsBackground from "../components/backgrounds/PlanetsOrbitsBackground";
import PlanktonBackground from "../components/backgrounds/PlanktonBackground";
import PlasmaBackground from "../components/backgrounds/PlasmaBackground";
import RaysBackground from "../components/backgrounds/RaysBackground";
import RidgeBackground from "../components/backgrounds/RidgeBackground";
import RingsBackground from "../components/backgrounds/RingsBackground";
import SandBackground from "../components/backgrounds/SandBackground";
import SandDotsBackground from "../components/backgrounds/SandDotsBackground";
import SeigaihaBackground from "../components/backgrounds/SeigaihaBackground";
import ShoalBackground from "../components/backgrounds/ShoalBackground";
import StarfishBackground from "../components/backgrounds/StarfishBackground";
import StringArtBackground from "../components/backgrounds/StringArtBackground";
import StringsBackground from "../components/backgrounds/StringsBackground";
import TentacleBackground from "../components/backgrounds/TentacleBackground";
import ThreadBackground from "../components/backgrounds/ThreadBackground";
import TileBackground from "../components/backgrounds/TileBackground";
import TileSpinBackground from "../components/backgrounds/TileSpinBackground";
import TriangleBackground2 from "../components/backgrounds/TriangleBackground2";
import TruchetBackground from "../components/backgrounds/TruchetBackground";
import TuringBackground from "../components/backgrounds/TuringBackground";
import TurtleBackground from "../components/backgrounds/TurtleBackground";
import VanishBackground from "../components/backgrounds/VanishBackground";
import VoronoiBackground from "../components/backgrounds/VoronoiBackground";
import WarpGridBackground from "../components/backgrounds/WarpGridBackground";
import WaterBackground from "../components/backgrounds/WaterBackground";
import WaveLayersBackground from "../components/backgrounds/WaveLayersBackground";
import WhaleBackground from "../components/backgrounds/WhaleBackground";
import FlipText from "../components/texts/FlipText";
import Button from "../components/ui/Button";
import ThemeToggle from "../components/ui/ThemeToggle";

/** Maps the `component` field from experiment frontmatter to a React component. */
export const registry: Record<string, ComponentType<any>> = {
  AnimatedBackground,
  AuroraBackground,
  BlobBackground,
  BubbleBackground,
  ChladniBackground,
  CircuitBackground,
  ClothBackground,
  CrossBackground,
  ContourBackground,
  Contour2Background,
  Contour3Background,
  CoralBackground,
  DandelionBackground,
  DitherBackground,
  DotBackground,
  FacetBackground,
  FieldLinesBackground,
  FirefliesBackground,
  FlatCausticsBackground,
  FlowBackground,
  FogBackground,
  GlobeBackground,
  IsoBackground,
  JellyBackground,
  KelpBackground,
  KoiBackground,
  KoiBackgroundII,
  LavaLampBackground,
  LeavesBackground,
  LifeBackground,
  LilyBackground,
  LissajousBackground,
  MantaBackground,
  MatrixBackground,
  MoireBackground,
  NeedleBackground,
  NetworkBackground2,
  OrbitBackground,
  PendulumWaveBackground,
  PhysarumBackground,
  PlanetsBackground,
  PlanetsOrbitsBackground,
  PlanktonBackground,
  PlasmaBackground,
  RaysBackground,
  RidgeBackground,
  RingsBackground,
  SandBackground,
  SandDotsBackground,
  SeigaihaBackground,
  ShoalBackground,
  StarfishBackground,
  StringArtBackground,
  StringsBackground,
  TentacleBackground,
  ThreadBackground,
  TileBackground,
  TileSpinBackground,
  TriangleBackground2,
  TruchetBackground,
  TuringBackground,
  TurtleBackground,
  VanishBackground,
  VoronoiBackground,
  WarpGridBackground,
  WaterBackground,
  WaveLayersBackground,
  WhaleBackground,
  FlipText,
  Button,
  ThemeToggle,
};

export function getComponent(id: string): ComponentType<any> | undefined {
  return registry[id];
}
