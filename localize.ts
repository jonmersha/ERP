import { Project, SyntaxKind, JsxText, JsxExpression, StringLiteral } from "ts-morph";
import * as fs from "fs";

const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
});

const translateKeys = new Set<string>();

const sourceFiles = project.getSourceFiles();
console.log("Found files:", sourceFiles.length);

for (const sourceFile of sourceFiles) {
    if (!sourceFile.getFilePath().includes("src/components") && !sourceFile.getFilePath().includes("src/pages") && !sourceFile.getFilePath().includes("src/app")) continue;
    if (sourceFile.getFilePath().includes("I18nProvider.tsx")) continue;

    let changed = false;
    let needsHookData = false;

    // Traverse all JSX Elements to find JSX text and attributes
    const jsxTexts = sourceFile.getDescendantsOfKind(SyntaxKind.JsxText);
    for (const textNode of jsxTexts) {
        let text = textNode.getLiteralText();
        // clean text
        text = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        if (text && /[a-zA-Z]/.test(text)) {
            translateKeys.add(text);
            textNode.replaceWithText(`{t("${text}")}`);
            changed = true;
            needsHookData = true;
        }
    }

    // Traverse Button strings inside JSX Expression, if any? Not needed, usually button text is JsxText
    // Let's find button and generic tags that have some props like label="xxx", but this is custom.
    // What about placeholders in inputs?
    const jsxAttributes = sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute);
    for (const attr of jsxAttributes) {
        if (["placeholder", "title", "label"].includes(attr.getNameNode().getText())) {
            const init = attr.getInitializer();
            if (init && init.getKind() === SyntaxKind.StringLiteral) {
                const text = (init as StringLiteral).getLiteralValue();
                if (text && /[a-zA-Z]/.test(text)) {
                    translateKeys.add(text);
                    attr.setInitializer(`{t("${text}")}`);
                    changed = true;
                    needsHookData = true;
                }
            }
        }
    }

    if (changed) {
        // Add import { useTranslation } from 'react-i18next'; if missing
        const imports = sourceFile.getImportDeclarations();
        const hasUseTranslation = imports.some(imp => imp.getModuleSpecifierValue() === "react-i18next");
        if (!hasUseTranslation) {
            sourceFile.addImportDeclaration({
                namedImports: ["useTranslation"],
                moduleSpecifier: "react-i18next",
            });
        }

        // We need to inject `const { t } = useTranslation();` inside component functions.
        // It's a bit tricky because we don't know the component name for sure, but we can look for Arrow Functions or Function Declarations that return JSX.
        const funcs = [...sourceFile.getFunctions(), ...sourceFile.getVariableDeclarations().map(v => v.getInitializerIfKind(SyntaxKind.ArrowFunction)).filter(Boolean)];
        
        for (const func of funcs) {
            if (!func) continue;
            // Check if it has a JSX element inside
            const hasJsx = func.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 || func.getDescendantsOfKind(SyntaxKind.JsxFragment).length > 0  || func.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length > 0;
            if (hasJsx) {
                // check if `t` is already declared
                const hasT = func.getVariableDeclarations().some(v => v.getName() === "t");
                if (!hasT) {
                    let block = null;
                    if (func.getKind() === SyntaxKind.FunctionDeclaration) {
                        block = (func as any).getBody();
                    } else if (func.getKind() === SyntaxKind.ArrowFunction) {
                        block = (func as any).getBody();
                        // If arrow function body is just JSX (no block), we need to wrap it.
                        if (block && block.getKind() !== SyntaxKind.Block) {
                            block.replaceWithText(`{\n const { t } = useTranslation();\n return ${block.getText()};\n}`);
                            continue;
                        }
                    }

                    if (block && block.getKind() === SyntaxKind.Block) {
                        block.insertStatements(0, "const { t } = useTranslation();");
                    }
                }
            }
        }

        sourceFile.saveSync();
    }
}

fs.writeFileSync("found_keys.json", JSON.stringify(Array.from(translateKeys), null, 2));
console.log("Done");
