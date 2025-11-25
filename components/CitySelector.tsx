import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Search, MapPin } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface Locality {
  id: string;
  name: string;
  province: string;
  region: string;
}

interface CitySelectorProps {
  onSelect: (locality: Locality) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

export function CitySelector({ onSelect, label, placeholder, error }: CitySelectorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Locality[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (text: string) => {
    setQuery(text);
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (text.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setShowResults(true);

    debounceTimeout.current = setTimeout(async () => {
      try {
        // Use localhost for dev, or env var
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/localities?q=${encodeURIComponent(text)}`);
        const data = await response.json();
        if (Array.isArray(data)) {
            setResults(data);
        } else {
            setResults([]);
        }
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleSelect = (locality: Locality) => {
    setQuery(`${locality.name} (${locality.province})`);
    setShowResults(false);
    onSelect(locality);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <Search size={20} color={Colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={query}
          onChangeText={handleSearch}
          placeholder={placeholder || 'Cerca la tua città'}
          placeholderTextColor={Colors.text.light}
        />
        {loading && (
          <ActivityIndicator size="small" color={Colors.orange} style={styles.loader} />
        )}
      </View>
      
      {showResults && results.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelect(item)}
              >
                <MapPin size={16} color={Colors.orange} style={{ marginRight: 8 }} />
                <Text style={styles.resultText}>
                  {item.name} <Text style={styles.provinceText}>({item.province})</Text>
                </Text>
              </TouchableOpacity>
            )}
            style={styles.list}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
      
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5C4A3A',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8DDD0',
    borderRadius: 12,
    paddingLeft: 44,
    paddingRight: 40,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: Colors.error,
  },
  loader: {
    position: 'absolute',
    right: 14,
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E8DDD0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxHeight: 200,
    zIndex: 1000,
  },
  list: {
    padding: 4,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F0EB',
  },
  resultText: {
    fontSize: 14,
    color: '#5C4A3A',
  },
  provinceText: {
    color: '#A0826D',
    fontSize: 12,
  },
  error: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 6,
    fontWeight: '500',
  },
});
