import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

// Define available languages
const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' }
];

export const LanguageSwitcher: React.FC<{ variant?: 'minimal' | 'full' }> = ({ 
  variant = 'full' 
}) => {
  const { i18n, t } = useTranslation();
  
  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  // Get the current language's display name
  const currentLanguage = languages.find(lang => lang.code === i18n.language)?.name || 'English';
  
  // Minimal variant shows just the icon and dropdown
  if (variant === 'minimal') {
    return (
      <Select value={i18n.language} onValueChange={changeLanguage}>
        <SelectTrigger className="w-10 h-9 px-2">
          <Globe className="h-4 w-4" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{t('settings.language')}</SelectLabel>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {t(`languages.${lang.code}`)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }
  
  // Full variant shows the label and selected language
  return (
    <Select value={i18n.language} onValueChange={changeLanguage}>
      <SelectTrigger className="w-full">
        <SelectValue>
          <div className="flex items-center">
            <Globe className="mr-2 h-4 w-4" />
            <span>{t(`languages.${i18n.language}`)}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{t('settings.language')}</SelectLabel>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {t(`languages.${lang.code}`)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;