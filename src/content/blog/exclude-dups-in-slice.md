---
title: Go の slice で重複を除外する
date: "2022-06-11"
tags: ["Go"]
draft: false
summary: Go の slice で重複を除いて処理したい場合どうすれば良いのかとふと思ったのでやってみた
---

## はじめに

最近 Go を勉強している。

slice を扱う際に重複を除いて処理したい場合どうすれば良いのかとふと思ったのでやってみた。PHP でいうところの [`array_unique`](https://www.php.net/manual/ja/function.array-unique.php) メソッドみたいなやつ。

## `[]string` の場合

まずは、シンプルに以下のような slice に対して行う。"a" と "c" が 2 回ずつ入っているので、これらを除外したい。

```go
strSlice := []string{"a", "b", "c", "d", "a", "c"}
```

以下のような関数を書いてみた。

```go showLineNumbers
func uniqueSlice(s []string) (r []string) {
    fmt.Printf("%v\n---> Start loop\n", s) // For debug
	set := make(map[string]bool)
	for i, v := range s {
		fmt.Println(i)  // For debug
		if set[v] {
			fmt.Printf("already set: %s\n", v)
		} else {
			set[v] = true
			r = append(r, v)
		}
	}
	fmt.Printf("--> End loop\n%v\n", set) // For debug
	fmt.Printf("%v\n", r)
	return
}
```

コード全文は[こちら](https://go.dev/play/p/8qG1Km5wqpW)

確認のため fmt パッケージを使って無駄に出力させていたり、わざと冗長に書いている部分もあったりするが、これを実行すると以下のようになる。

```sh
# output
[a b c d a c]
---> Start loop
0
1
2
3
4
already set: a
5
already set: c
---> End loop
map[a:true b:true c:true d:true]
[a b c d]
```

重複して出現する "a" と "c" を除外できた。

キーが string、バリューが bool の map を使って出現確認をしている訳だが、`if mapValName[keyName] {}` とすっきり書くことができる。map にセットされているキーがもう一度出現する際は、既に true となるためスキップされる。

## `[]int` の場合

`uniqueSlice` の引数と返り値、map のキーを int にしてあげれば同じように実現できる。やり方は同じなので、コードの解説は省略する。

コード全文は[こちら](https://go.dev/play/p/tLHEcvk_Bpq)

## `[]int` にも `[]string`にも同時に対応する

その次にやりたくなることとしては、slice の型に依らず同じことが実現したくなるのではないだろうか。

Go では全ての型と互換性を持っている interface{} 型というのがある。引数で interface{} として受け取り、関数内部で型アサーションをすることで `[]int`, `[]string` といった型に依らないように実装できそうだったのやってみた！

```go showLineNumbers
func uniqueSlice(i interface{}) (r []interface{}) {
	switch s := i.(type) {
	case []int:
		set := make(map[int]bool)
		for _, v := range s {
			if !set[v] {
				set[v] = true
				r = append(r, v)
			}

		}
	case []string:
		set := make(map[string]bool)
		for _, v := range s {
			if !set[v] {
				set[v] = true
				r = append(r, v)
			}
		}
	default:
		fmt.Println("type is not allowed") // 雑に
	}
	return
}
```

コード全文は[こちら](https://go.dev/play/p/AbvtuWPF_f7)

やってみたはいいが case 文の中身の処理がほぼ同じで残念な感じになってしまった。なんとなくこうなることは分かっていたが…。

個人的には case 文が増えていくよりは、それぞれの関数を作る方がまだマシなじゃないかなーと思う。

## まとめ

Go における slice の重複削除についてまとめてみた。
もっとこういうやり方があるよという方がいたら下のツイートボタンからコメントしていただけると大変嬉しい。

Go のお作法についてはまだまだキャッチアップする必要がありそう。

## 参考

https://go-tour-jp.appspot.com/methods/15
