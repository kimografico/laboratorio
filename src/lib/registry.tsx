import type { ComponentType } from "react";
import AnimatedBackground from "../components/backgrounds/AnimatedBackground";
import AuroraBackground from "../components/backgrounds/AuroraBackground";
import BlobBackground from "../components/backgrounds/BlobBackground";
import BubbleBackground from "../components/backgrounds/BubbleBackground";
import ChladniBackground from "../components/backgrounds/ChladniBackground";
import CircuitBackground from "../components/backgrounds/CircuitBackground";
import CobwebBackground from "../components/backgrounds/CobwebBackground";
import ClothBackground from "../components/backgrounds/ClothBackground";
import Contour2Background from "../components/backgrounds/Contour2Background";
import CoralBackground from "../components/backgrounds/CoralBackground";
import CrackBackground from "../components/backgrounds/CrackBackground";
import CrossBackground from "../components/backgrounds/CrossBackground";
import DandelionBackground from "../components/backgrounds/DandelionBackground";
import DitherBackground from "../components/backgrounds/DitherBackground";
import DotBackground from "../components/backgrounds/DotBackground";
import FibonacciGroveBackground from "../components/backgrounds/FibonacciGroveBackground";
import FieldLinesBackground from "../components/backgrounds/FieldLinesBackground";
import FirefliesBackground from "../components/backgrounds/FirefliesBackground";
import FireworksBackground from "../components/backgrounds/FireworksBackground";
import FlatCausticsBackground from "../components/backgrounds/FlatCausticsBackground";
import FlowBackground from "../components/backgrounds/FlowBackground";
import FogBackground from "../components/backgrounds/FogBackground";
import GalaxyBackground from "../components/backgrounds/GalaxyBackground";
import GlobeBackground from "../components/backgrounds/GlobeBackground";
import GardenEelBackground from "../components/backgrounds/GardenEelBackground";
import HexGridBackground from "../components/backgrounds/HexGridBackground";
import IsoBackground from "../components/backgrounds/IsoBackground";
import JellyBackground from "../components/backgrounds/JellyBackground";
import KaleidoscopeBackground from "../components/backgrounds/KaleidoscopeBackground";
import KelpBackground from "../components/backgrounds/KelpBackground";
import KoiBackground from "../components/backgrounds/KoiBackground";
import LavaLampBackground from "../components/backgrounds/LavaLampBackground";
import LifeBackground from "../components/backgrounds/LifeBackground";
import MimosaPudicaBackground from "../components/backgrounds/MimosaPudicaBackground";
import LilyBackground from "../components/backgrounds/LilyBackground";
import MantaBackground from "../components/backgrounds/MantaBackground";
import MarblesBackground from "../components/backgrounds/MarblesBackground";
import MatrixBackground from "../components/backgrounds/MatrixBackground";
import MazeLightBackground from "../components/backgrounds/MazeLightBackground";
import MeadowBackground from "../components/backgrounds/MeadowBackground";
import NeedleBackground from "../components/backgrounds/NeedleBackground";
import NetworkBackground2 from "../components/backgrounds/NetworkBackground2";
import OrbitBackground from "../components/backgrounds/OrbitBackground";
import PendulumWaveBackground from "../components/backgrounds/PendulumWaveBackground";
import PenroseBackground from "../components/backgrounds/PenroseBackground";
import PhysarumBackground from "../components/backgrounds/PhysarumBackground";
import PhyllotaxisBackground from "../components/backgrounds/PhyllotaxisBackground";
import PlanetsOrbitsBackground from "../components/backgrounds/PlanetsOrbitsBackground";
import PlanktonBackground from "../components/backgrounds/PlanktonBackground";
import PlasmaBackground from "../components/backgrounds/PlasmaBackground";
import RainRipplesBackground from "../components/backgrounds/RainRipplesBackground";
import RidgeBackground from "../components/backgrounds/RidgeBackground";
import RingsBackground from "../components/backgrounds/RingsBackground";
import SandBackground from "../components/backgrounds/SandBackground";
import SandDotsBackground from "../components/backgrounds/SandDotsBackground";
import SandpileBackground from "../components/backgrounds/SandpileBackground";
import SeigaihaBackground from "../components/backgrounds/SeigaihaBackground";
import ShoalBackground from "../components/backgrounds/ShoalBackground";
import SnowflakeBackground from "../components/backgrounds/SnowflakeBackground";
import StarfishBackground from "../components/backgrounds/StarfishBackground";
import StringArtBackground from "../components/backgrounds/StringArtBackground";
import StringsBackground from "../components/backgrounds/StringsBackground";
import TentacleBackground from "../components/backgrounds/TentacleBackground";
import ThreadBackground from "../components/backgrounds/ThreadBackground";
import TileBackground from "../components/backgrounds/TileBackground";
import TileSpinBackground from "../components/backgrounds/TileSpinBackground";
import TrendilBackground from "../components/backgrounds/TrendilBackground";
import TriangleBackground2 from "../components/backgrounds/TriangleBackground2";
import TruchetBackground from "../components/backgrounds/TruchetBackground";
import TuringBackground from "../components/backgrounds/TuringBackground";
import VanishBackground from "../components/backgrounds/VanishBackground";
import VoronoiBackground from "../components/backgrounds/VoronoiBackground";
import WarpGridBackground from "../components/backgrounds/WarpGridBackground";
import WaterBackground from "../components/backgrounds/WaterBackground";
import WaveLayersBackground from "../components/backgrounds/WaveLayersBackground";
import WhaleBackground from "../components/backgrounds/WhaleBackground";
import BlurInText from "../components/texts/BlurInText";
import FadeUpText from "../components/texts/FadeUpText";
import FlipText from "../components/texts/FlipText";
import GlitchText from "../components/texts/GlitchText";
import GlowText from "../components/texts/GlowText";
import ScaleInText from "../components/texts/ScaleInText";
import ShineText from "../components/texts/ShineText";
import TiltInText from "../components/texts/TiltInText";
import TrackingInText from "../components/texts/TrackingInText";
import TypewriterText from "../components/texts/TypewriterText";
import WaveText from "../components/texts/WaveText";
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
  CobwebBackground,
  ClothBackground,
  CrossBackground,
  Contour2Background,
  CoralBackground,
  CrackBackground,
  DandelionBackground,
  DitherBackground,
  DotBackground,
  FibonacciGroveBackground,
  FieldLinesBackground,
  FirefliesBackground,
  FireworksBackground,
  FlatCausticsBackground,
  FlowBackground,
  FogBackground,
  GalaxyBackground,
  GlobeBackground,
  GardenEelBackground,
  HexGridBackground,
  IsoBackground,
  JellyBackground,
  KaleidoscopeBackground,
  KelpBackground,
  KoiBackground,
  LavaLampBackground,
  LifeBackground,
  MimosaPudicaBackground,
  LilyBackground,
  MantaBackground,
  MarblesBackground,
  MatrixBackground,
  MazeLightBackground,
  MeadowBackground,
  NeedleBackground,
  NetworkBackground2,
  OrbitBackground,
  PendulumWaveBackground,
  PenroseBackground,
  PhysarumBackground,
  PhyllotaxisBackground,
  PlanetsOrbitsBackground,
  PlanktonBackground,
  PlasmaBackground,
  RainRipplesBackground,
  RidgeBackground,
  RingsBackground,
  SandBackground,
  SandDotsBackground,
  SandpileBackground,
  SeigaihaBackground,
  ShoalBackground,
  SnowflakeBackground,
  StarfishBackground,
  StringArtBackground,
  StringsBackground,
  TentacleBackground,
  ThreadBackground,
  TileBackground,
  TileSpinBackground,
  TrendilBackground,
  TriangleBackground2,
  TruchetBackground,
  TuringBackground,
  VanishBackground,
  VoronoiBackground,
  WarpGridBackground,
  WaterBackground,
  WaveLayersBackground,
  WhaleBackground,
  BlurInText,
  FadeUpText,
  FlipText,
  GlitchText,
  GlowText,
  ScaleInText,
  ShineText,
  TiltInText,
  TrackingInText,
  TypewriterText,
  WaveText,
  Button,
  ThemeToggle,
};

export function getComponent(id: string): ComponentType<any> | undefined {
  return registry[id];
}

