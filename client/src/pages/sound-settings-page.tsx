import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings, Volume2, VolumeX, Download, Music } from 'lucide-react';
import SoundTestButton from '@/components/sound-test-button';
import { generateAchievementSounds } from '@/lib/generateSounds';
import { cn } from '@/lib/utils';

const SoundSettingsPage = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(60);
  const [loading, setLoading] = useState(false);
  
  const handleGenerateSounds = async () => {
    setLoading(true);
    try {
      await generateAchievementSounds();
    } catch (error) {
      console.error('Error generating sounds:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Pengaturan Suara | InfoPekerjaan.id</title>
      </Helmet>
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">Pengaturan Suara</h1>
        <p className="text-muted-foreground mb-8">
          Sesuaikan pengaturan suara untuk pengalaman yang lebih baik di InfoPekerjaan.id
        </p>
        
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Pengaturan
            </TabsTrigger>
            <TabsTrigger value="test">
              <Music className="h-4 w-4 mr-2" />
              Tes Suara
            </TabsTrigger>
          </TabsList>
          
          {/* Tab Pengaturan */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Suara</CardTitle>
                <CardDescription>
                  Konfigurasi preferensi suara pada aplikasi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="sound-enabled">Efek Suara</Label>
                    <p className="text-sm text-muted-foreground">
                      Aktifkan atau nonaktifkan efek suara dalam aplikasi
                    </p>
                  </div>
                  <Switch
                    id="sound-enabled"
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="volume">Volume</Label>
                    <span className="text-sm text-muted-foreground">{volume}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <VolumeX className="h-4 w-4" />
                    <Slider
                      id="volume"
                      disabled={!soundEnabled}
                      value={[volume]}
                      min={0}
                      max={100}
                      step={5}
                      className="flex-1"
                      onValueChange={(vals) => setVolume(vals[0])}
                    />
                    <Volume2 className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Reset ke Default</Button>
                <Button>Simpan Pengaturan</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Tab Tes Suara */}
          <TabsContent value="test">
            <Card>
              <CardHeader>
                <CardTitle>Tes Efek Suara</CardTitle>
                <CardDescription>
                  Dengarkan dan uji efek suara achievement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SoundTestButton
                      soundType="unlock"
                      label="Unlock Achievement"
                      className="w-full"
                    />
                    <SoundTestButton
                      soundType="bronze"
                      label="Bronze Achievement"
                      className="w-full"
                    />
                    <SoundTestButton
                      soundType="silver"
                      label="Silver Achievement"
                      className="w-full"
                    />
                    <SoundTestButton
                      soundType="gold"
                      label="Gold Achievement"
                      className="w-full"
                    />
                    <SoundTestButton
                      soundType="platinum"
                      label="Platinum Achievement"
                      className="w-full"
                    />
                  </div>
                  
                  <div className={cn(
                    "p-4 rounded-lg mt-4 bg-muted",
                    "border border-dashed border-muted-foreground/50"
                  )}>
                    <h3 className="font-medium mb-2 flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Generate File Suara
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate file suara WAV untuk achievement. Fitur ini hanya untuk development.
                    </p>
                    <Button 
                      onClick={handleGenerateSounds} 
                      disabled={loading} 
                      variant="outline"
                      size="sm"
                    >
                      {loading ? 'Generating...' : 'Generate Sound Files'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default SoundSettingsPage;