// import Logo from "../Logo";
import Navbar from "./Navbar";

export default function Header() {
  return (
    <header className="sticky top-0 h-16 bg-foreground z-30 shadow">
      <div className="container flex items-center justify-between">
        <Navbar />
      </div>
    </header>
  );
}
