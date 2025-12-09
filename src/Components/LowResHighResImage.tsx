import React, {useState} from 'react';
import {View, Image, StyleSheet} from 'react-native';

const LowResHighResImage = ({lowResUri, highResUri, style}: any) => {
    const [isHighResLoaded, setHighResLoaded] = useState(false);

    return (
        <View style={[styles.container, style]}>
            <Image
                source={{uri: lowResUri}}
                style={[styles.image, isHighResLoaded && styles.hidden]}
                resizeMode="cover"
            />
            <Image
                source={{uri: highResUri}}
                style={styles.image}
                onLoad={() => setHighResLoaded(true)}
                resizeMode="cover"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    hidden: {
        opacity: 0,
    },
});

export default LowResHighResImage;

