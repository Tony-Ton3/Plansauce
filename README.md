# Testing Markdown Page

This page demonstrates various Markdown formatting options and syntax.

## Headers

You can create headers using `#` symbols:

# H1 Header
## H2 Header  
### H3 Header
#### H4 Header
##### H5 Header
###### H6 Header

## Text Formatting

**Bold text** or __bold text__

*Italic text* or _italic text_

***Bold and italic*** or ___bold and italic___

~~Strikethrough text~~

`Inline code`

## Lists

### Unordered Lists

- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

### Ordered Lists

1. First item
2. Second item
   1. Nested item 2.1
   2. Nested item 2.2
3. Third item

### Task Lists

- [x] Completed task
- [ ] Incomplete task
- [ ] Another incomplete task

## Links and Images

[Link to Google](https://www.google.com)

[Link with title](https://www.example.com "Example Website")

![Alt text for image](https://via.placeholder.com/150x100 "Image title")

## Code Blocks

### Inline Code
Use `console.log()` to print output.

### Code Blocks

```javascript
function greetUser(name) {
    console.log(`Hello, ${name}!`);
}

greetUser("World");
```

```python
def calculate_area(radius):
    return 3.14159 * radius ** 2

area = calculate_area(5)
print(f"Area: {area}")
```

## Blockquotes

> This is a blockquote.
> 
> It can span multiple lines.
>
> > This is a nested blockquote.

## Tables

| Name | Age | City |
|------|-----|------|
| Alice | 25 | New York |
| Bob | 30 | Los Angeles |
| Charlie | 35 | Chicago |

### Table with Alignment

| Left Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|--------------:|
| Left | Center | Right |
| Text | Text | Text |

## Horizontal Rules

---

***

___

## Line Breaks

This is the first line.  
This is the second line (two spaces at the end of previous line).

This is a new paragraph.

## Escaping Characters

\*This text is not italic\*

\`This is not code\`

## HTML in Markdown

You can use <strong>HTML tags</strong> in Markdown.

<details>
<summary>Click to expand</summary>

This content is hidden by default and can be expanded by clicking the summary.

</details>

## Mathematical Expressions (if supported)

Inline math: $E = mc^2$

Block math:
$$
\sum_{i=1}^{n} x_i = x_1 + x_2 + \cdots + x_n
$$

## Footnotes (if supported)

This text has a footnote[^1].

[^1]: This is the footnote content.

## Definition Lists (if supported)

Term 1
: Definition 1

Term 2
: Definition 2a
: Definition 2b

---

*This example covers most common Markdown syntax. Different Markdown parsers may support additional features or have slight variations in implementation.*

