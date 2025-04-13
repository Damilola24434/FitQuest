package main

import (
	"fmt"
)

func CharCount(chars []string) map[string]int {
	counts := make(map[string]int)
	for _, char := range chars {
		counts[char]++
	}
	return counts
}

func SimpleCypher(s string) int {
	values := map[rune]int{
		'M': 1000,
		'D': 500,
		'C': 100,
		'L': 50,
		'X': 10,
		'V': 5,
		'I': 1,
	}

	total := 0
	for _, ch := range s {
		total += values[ch]
	}
	return total
}

func main() {
	fmt.Println("CharCount")
	inputChars := []string{"a", "b", "a", "f", "b", "a", "z", "c", "c"}
	charCountResult := CharCount(inputChars)
	fmt.Println("Input:", inputChars)
	fmt.Println("Output:", charCountResult)

	fmt.Println("\nSimpleCypher")
	inputString := "MCLX"
	actualOutput := SimpleCypher(inputString)
	fmt.Printf("Input: %s \nOutput: %d", inputString, actualOutput)
}
