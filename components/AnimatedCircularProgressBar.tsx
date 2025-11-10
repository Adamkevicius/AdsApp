import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, CircleProps } from 'react-native-svg';


const AnimatedCircularProgressBar = () => {
    useEffect(() => {
            progress.value = withRepeat(
                withTiming(1, { duration: 1600}),
                -1,
                false
            )
    }, [])

    const {
        width,
        height
    } = Dimensions.get("window")

    const circle_length = 100
    const r = circle_length / (2 * Math.PI)

    const AnimatedCircle = Animated.createAnimatedComponent(Circle)

    const progress = useSharedValue<number>(0)

    const animatedProps = useAnimatedProps<CircleProps>(() => ({
        strokeDashoffset: circle_length * (1 - progress.value)
    }))
  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Circle
            cx={ width / 2}
            cy={ height / 2}
            r={r}
            stroke={"#D8DAA7"}
            strokeWidth={15}
        />
        <AnimatedCircle
            cx={ width / 2}
            cy={ height / 2}
            r={r}
            stroke={"#577A56"}
            strokeWidth={5}
            strokeDasharray={circle_length / 50}
            animatedProps={animatedProps}
            fill={"#eee6a9ff"}
        />    
      </Svg>
    </View>
  )
}

export default AnimatedCircularProgressBar

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})