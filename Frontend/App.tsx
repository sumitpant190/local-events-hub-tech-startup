import AppShell from './src/components/AppShell';
import ThemeProvider from './src/theme/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
