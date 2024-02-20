/**
 * ノード。
 */
type Node =
  | { kind: "Str"; value: string }
  | { kind: "Var"; nodes: Node[] }

/**
 * 括弧。
 *
 * @template L 左括弧。
 * @template R 右括弧。
 */
type Brackets<L extends string, R extends string> = readonly [L, R]

/**
 * 字句解析する。
 *
 * @template L 左括弧。
 * @template R 右括弧。
 * @param text 字句解析する文字列。
 * @param brackets 字句解析する際の括弧。
 * @returns 字句解析後のトークン。
 */
function tokenize<const L extends string, const R extends string>(
  text: string,
  brackets: Brackets<L, R>,
) {
  const [lb, rb] = brackets

  return text
    .split(lb)
    .flatMap<L | R | (string & {})>(p1 => [
      lb,
      ...p1
        .split(rb)
        .flatMap(p2 => [p2, rb])
        .slice(0, -1),
    ])
    .slice(1)
}

/**
 * 構文解析する。
 *
 * @param tokens 字句解析後のトークン。
 * @returns 構文解析後のノード。
 */
function parse(
  tokens: ReturnType<typeof tokenize>,
  brackets: Brackets<string, string>,
): Node[] {
  const [lb, rb] = brackets
  const nodes: Node[] = []
  let token

  while ((token = tokens.shift()) !== undefined && token !== rb) {
    if (token === lb) {
      nodes.push({
        kind: "Var",
        nodes: parse(tokens, brackets),
      })
    } else {
      nodes.push({
        kind: "Str",
        value: token,
      })
    }
  }

  return nodes
}

/**
 * 文字列ノードを文字列に変換する。
 *
 * @param node 文字列ノード。
 * @returns 文字列ノードを文字列に変換した結果。
 */
function fromStr(node: Extract<Node, { kind: "Str" }>): {
  result: string
} {
  return {
    result: node.value,
  }
}

/**
 * 変数ノードを文字列に変換する。
 *
 * @param node 変数ノード。
 * @param replacer 変数を置換する関数。
 * @returns 変数ノードを文字列に変換した結果。
 */
function fromVar(
  node: Extract<Node, { kind: "Var" }>,
  replacer: (part: string) => string | readonly string[],
): {
  result: readonly string[]
} {
  let result: string[] = []

  for (const n of node.nodes) {
    if (n.kind === "Str") {
      const str = fromStr(n)
      result = result.length
        ? result.map(r => r + str.result)
        : [str.result]
    } else {
      const var_ = fromVar(n, replacer)
      result = result.length
        ? result.flatMap(r => var_.result.map(v => r + v))
        : [...var_.result]
    }
  }

  return {
    result: result.flatMap(replacer),
  }
}

/**
 * 指定した文字列で始まり、指定した文字列で終わる部分を置換する。
 *
 * @template L 左括弧。
 * @template R 右括弧。
 * @param text 対象の文字列。
 * @param brackets 置換する部分の文字列。
 * @param replacer 置換する部分を受け取り、置換後の文字列を返す関数。
 * @returns 置換後の文字列。
 */
export default function replace<const L extends string, const R extends string>(
  text: string,
  brackets: readonly [left: L, right: R],
  replacer: (part: string) => string | readonly string[],
): string[] {
  const [lb, rb] = brackets

  if (text.indexOf(lb) === -1 && text.indexOf(rb) === -1) {
    return [text]
  }

  let result: string[] = []

  for (const n of parse(tokenize(text, brackets), brackets)) {
    if (n.kind === "Str") {
      const str = fromStr(n)
      result = result.length
        ? result.map(r => r + str.result)
        : [str.result]
    } else {
      const var_ = fromVar(n, replacer)
      result = result.length
        ? result.flatMap(r => var_.result.map(v => r + v))
        : [...var_.result]
    }
  }

  return result
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/theme/build/replace", () => {
    test("字句解析", () => {
      assert.deepEqual(
        tokenize("a${{ ${{ b }} ${{ c }} }}c${{d}}e", ["${{", "}}"]),
        [
          "a",
          "${{",
          " ",
          "${{",
          " b ",
          "}}",
          " ",
          "${{",
          " c ",
          "}}",
          " ",
          "}}",
          "c",
          "${{",
          "d",
          "}}",
          "e",
        ],
      )
    })

    test("構文解析", () => {
      assert.deepEqual(
        parse(
          tokenize("a${{ ${{ b }} ${{ c }} }}c${{d}}e", ["${{", "}}"]),
          ["${{", "}}"],
        ),
        [
          { kind: "Str", value: "a" },
          {
            kind: "Var",
            nodes: [
              { kind: "Str", value: " " },
              {
                kind: "Var",
                nodes: [
                  { kind: "Str", value: " b " },
                ],
              },
              { kind: "Str", value: " " },
              {
                kind: "Var",
                nodes: [
                  { kind: "Str", value: " c " },
                ],
              },
              { kind: "Str", value: " " },
            ],
          },
          { kind: "Str", value: "c" },
          {
            kind: "Var",
            nodes: [
              { kind: "Str", value: "d" },
            ],
          },
          { kind: "Str", value: "e" },
        ],
      )
    })

    test("変数を置き換える", () => {
      assert.deepEqual(
        replace(
          "${{a}}",
          ["${{", "}}"],
          part => part.toUpperCase(),
        ),
        [
          "A",
        ],
      )
    })

    test("変数を複数の文字列に置き換える", () => {
      assert.deepEqual(
        replace(
          "${{a}}",
          ["${{", "}}"],
          part => [
            part.toUpperCase(),
            part.toLowerCase(),
          ],
        ),
        [
          "A",
          "a",
        ],
      )
    })

    test("複数の変数を置き換える", () => {
      assert.deepEqual(
        replace(
          "${{a}} ${{ b }}",
          ["${{", "}}"],
          part => part.trim().toUpperCase(),
        ),
        [
          "A B",
        ],
      )
    })

    test("ネストした変数を置き換える", () => {
      assert.deepEqual(
        replace(
          "${{ ${{ a }} ${{ b }} }}",
          ["${{", "}}"],
          part => part.trim().toUpperCase(),
        ),
        [
          "A B",
        ],
      )
    })
  })
}
