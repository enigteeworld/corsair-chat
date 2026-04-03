import {
  BookOpen,
  CalendarCheck,
  FileText,
  FlaskConical,
  Home,
  Layers,
  Map,
  MessageSquare,
  Zap,
} from "lucide-react";

export const navigation = [
  { href: "/", label: "Home", icon: Home },
  { href: "/agent", label: "Agent", icon: MessageSquare },
  { href: "/collections", label: "Collections", icon: Layers },
  { href: "/resources", label: "Resources", icon: Zap },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/pow", label: "PoW", icon: CalendarCheck },
  { href: "/blog", label: "Blog", icon: FileText },
  { href: "/docs", label: "Docs", icon: BookOpen },
  { href: "/playground", label: "Playground", icon: FlaskConical },
] as const;