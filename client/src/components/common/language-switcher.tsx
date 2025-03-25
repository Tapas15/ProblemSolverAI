import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: 'Chinese (简体中文)' },
  { code: 'hi', name: 'Hindi (हिन्दी)' }
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  // Update the selected language whenever i18n.language changes
  useEffect(() => {
    const shortCode = i18n.language.split('-')[0]; // Handle formats like 'en-US'
    setSelectedLanguage(shortCode);
  }, [i18n.language]);

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    setSelectedLanguage(value);
  };

  return (
    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-full h-9 sm:h-10 pl-8 sm:pl-10 text-sm">
        <Globe className="absolute left-2 sm:left-3 text-gray-400 h-4 w-4" />
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="text-xs sm:text-sm">Languages</SelectLabel>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} className="text-xs sm:text-sm relative pl-8">
              {selectedLanguage === lang.code && (
                <Check className="h-3 w-3 sm:h-4 sm:w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-[#0078D7]" />
              )}
              {lang.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};