'use client';
import { useState, useRef } from 'react';
import UploadZone from '../components/UploadZone';
import Wheel, { WheelHandle } from '../components/Wheel';

type NameGroups = {
  Aanwezig: string[];
  Verontschuldigd: string[];
  Afwezig: string[];
};

export default function Home() {
  const [names, setNames] = useState<NameGroups | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<{
    [key in keyof NameGroups]?: boolean;
  }>({});
  const [chosenName, setChosenName] = useState('');
  const wheelRef = useRef<WheelHandle>(null);

  const toggleGroup = (group: keyof NameGroups) => {
    setSelectedGroup((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const getNamesForWheel = () => {
    if (!names) return [];
    const activeNames: string[] = [];

    for (const group of Object.keys(names) as (keyof NameGroups)[]) {
      if (selectedGroup[group]) {
        activeNames.push(...names[group]);
      }
    }

    return activeNames;
  };

  const handleSpinComplete = (name: string) => {
    setChosenName(name);

    // Remove the selected name from the respective list
    const updatedNames: NameGroups = {
      Aanwezig: names?.Aanwezig?.filter((n) => n !== name) || [],
      Verontschuldigd: names?.Verontschuldigd?.filter((n) => n !== name) || [],
      Afwezig: names?.Afwezig?.filter((n) => n !== name) || [],
    };

    setNames(updatedNames);
  };

  const handleSpinStart = () => {
    const candidates = getNamesForWheel();
    if (candidates.length === 0) {
      alert('No names selected.');
      return;
    }
    wheelRef.current?.startSpin();
  };

  return (
      <main className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-8 h-screen">
        <div className="w-full md:w-1/4 space-y-4 overflow-y-auto">
          <h1 className="text-2xl font-bold">Google Doc Name Picker</h1>

          <UploadZone
              onParsed={(parsed: { aanwezig: string[]; verontschuldigd: string[]; afwezig: string[] }) => {
                setNames({
                  Aanwezig: parsed.aanwezig,
                  Verontschuldigd: parsed.verontschuldigd,
                  Afwezig: parsed.afwezig,
                });
                setSelectedGroup({
                  Aanwezig: true,
                  Verontschuldigd: true,
                  Afwezig: true,
                });
                setChosenName('');
              }}
          />

          {names && (
              <>
                <div className="space-y-2">
                  {(Object.keys(names) as (keyof NameGroups)[]).map((group) => (
                      <div key={group}>
                        <label className="flex items-center space-x-2">
                          <input
                              type="checkbox"
                              checked={!!selectedGroup[group]}
                              onChange={() => toggleGroup(group)}
                          />
                          <span>
                      {group} ({names[group].length})
                    </span>
                        </label>
                      </div>
                  ))}
                </div>

                <button
                    onClick={handleSpinStart}
                    className="bg-green-600 text-white px-6 py-2 rounded w-full"
                >
                  Spin the Wheel
                </button>

                {chosenName && (
                    <div className="text-lg font-semibold mt-4">
                      🎉 Chosen: <span className="text-blue-600">{chosenName}</span>
                    </div>
                )}
              </>
          )}
        </div>

        <div className="w-full md:w-3/4 flex items-center justify-center h-full">
          <Wheel
              ref={wheelRef}
              names={getNamesForWheel()}
              onSpinEnd={handleSpinComplete}
          />
        </div>
      </main>
  );
}