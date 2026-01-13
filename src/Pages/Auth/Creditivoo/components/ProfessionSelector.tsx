import React, {useState, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../styles';
// Mantenemos la importación original por si decides revertir
import {professions as defaultProfessions} from '../utils/professions';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export interface Profession {
  id: number | string; // Permitimos string para tus nuevos IDs si fuera necesario
  nombre: string;
}

interface ProfessionSelectorProps {
  value: string;
  onSelect: (profession: string) => void;
  error?: boolean;
  placeholder?: string;
  containerStyle?: any;
  // NUEVA PROP: Permite recibir los datos desde afuera
  data?: { label: string; value: string }[]; 
}

const ProfessionSelector: React.FC<ProfessionSelectorProps> = ({
  value,
  onSelect,
  error = false,
  placeholder = 'Selecciona tu profesión',
  containerStyle,
  data, // Recibimos la nueva prop
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- LÓGICA MODIFICADA PARA SOPORTAR DATOS ESTÁTICOS ---
  const filteredProfessions = useMemo(() => {
    // 1. Priorizamos la prop 'data' si viene del padre, si no usamos el archivo de utilidades
    const sourceData = data 
      ? data.map((item, index) => ({ id: index, nombre: item.label })) 
      : (defaultProfessions || []);

    if (sourceData.length === 0) return [];
    
    if (!searchQuery.trim()) return sourceData;

    const query = searchQuery.toLowerCase().trim();
    return sourceData.filter(profession =>
      profession.nombre.toLowerCase().includes(query),
    );
  }, [searchQuery, data]);
  // -------------------------------------------------------

  /* // LÓGICA ORIGINAL COMENTADA (DINÁMICA)
  const filteredProfessionsOriginal = useMemo(() => {
    if (!professions || professions.length === 0) return [];
    if (!searchQuery.trim()) return professions;
    const query = searchQuery.toLowerCase().trim();
    return professions.filter(profession =>
      profession.nombre.toLowerCase().includes(query),
    );
  }, [searchQuery]); 
  */

  const handleSelectProfession = (profession: Profession) => {
    onSelect(profession.nombre);
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleOpenModal = () => {
    setModalVisible(true);
    setSearchQuery('');
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSearchQuery('');
  };

  const renderProfessionItem = ({item}: {item: Profession}) => (
    <TouchableOpacity
      style={styles.professionItem}
      onPress={() => handleSelectProfession(item)}
      activeOpacity={0.7}>
      <Text style={styles.professionItemText}>{item.nombre}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={[styles.inputContainer, error && styles.inputError]}
        onPress={handleOpenModal}
        activeOpacity={0.8}>
        <Text
          style={[styles.inputText, !value && styles.inputPlaceholder]}
          numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Icon
          name="chevron-down"
          type={IconType.Ionicons}
          size={SCREEN_WIDTH * 0.05}
          color={IVOO_COLORS.grayMedium}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={handleCloseModal}
          />
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona tu profesión</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseModal}
                activeOpacity={0.7}>
                <Icon
                  name="close"
                  type={IconType.Ionicons}
                  size={SCREEN_WIDTH * 0.06}
                  color={IVOO_COLORS.textPrimary}
                />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Icon
                name="search"
                type={IconType.Ionicons}
                size={SCREEN_WIDTH * 0.05}
                color={IVOO_COLORS.grayMedium}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar profesión..."
                placeholderTextColor="#B4B4B4"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setSearchQuery('')}
                  activeOpacity={0.7}>
                  <Icon
                    name="close-circle"
                    type={IconType.Ionicons}
                    size={SCREEN_WIDTH * 0.05}
                    color={IVOO_COLORS.grayMedium}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Professions List */}
            <FlatList
              data={filteredProfessions}
              renderItem={renderProfessionItem}
              keyExtractor={item => item.id.toString()}
              style={styles.professionsList}
              contentContainerStyle={styles.professionsListContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              removeClippedSubviews={false}
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={10}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchQuery.trim()
                      ? 'No se encontraron profesiones'
                      : 'Cargando profesiones...'}
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ... (Los estilos se mantienen igual que en tu archivo original)
const styles = StyleSheet.create({
  container: { width: '100%' },
  inputContainer: { width: '100%', backgroundColor: '#F9FAFC', borderWidth: 1, borderColor: 'rgba(110, 113, 124, 0.31)', borderRadius: 10, paddingHorizontal: 16, minHeight: SCREEN_HEIGHT * 0.065, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inputError: { borderColor: IVOO_COLORS.error },
  inputText: { flex: 1, fontSize: SCREEN_WIDTH * 0.04, fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular, color: IVOO_COLORS.textPrimary, marginRight: 8 },
  inputPlaceholder: { color: '#B4B4B4' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: IVOO_COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: SCREEN_HEIGHT * 0.85, minHeight: SCREEN_HEIGHT * 0.5, paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalTitle: { fontSize: SCREEN_WIDTH * 0.048, fontFamily: IVOO_TYPOGRAPHY.fonts.interBold, color: IVOO_COLORS.textPrimary, flex: 1 },
  closeButton: { padding: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFC', borderRadius: 10, marginHorizontal: 20, marginTop: 16, marginBottom: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(110, 113, 124, 0.31)', minHeight: SCREEN_HEIGHT * 0.055 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: SCREEN_WIDTH * 0.04, color: IVOO_COLORS.textPrimary, paddingVertical: 0 },
  clearButton: { padding: 4, marginLeft: 4 },
  professionsList: { flex: 1, width: '100%' },
  professionsListContent: { paddingBottom: 10 },
  professionItem: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  professionItemText: { fontSize: SCREEN_WIDTH * 0.04, color: IVOO_COLORS.textPrimary },
  emptyContainer: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: SCREEN_WIDTH * 0.038, color: IVOO_COLORS.grayMedium },
  modalOverlayTouchable: {},
});

export default ProfessionSelector;