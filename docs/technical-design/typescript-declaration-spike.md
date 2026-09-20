# TypeScript declaration parser spike

**Status:** Isolated synthetic WP2 precursor; not a production adapter, released pack, or WP2 acceptance. The WP1 contract freeze remains open.

`packages/extractor-spike` uses the pinned TypeScript compiler's public syntactic API on caller-supplied text. It does not read a repository, resolve an import, run a build script, execute source code, load a semantic index or connect to an enterprise source. It returns only top-level class/interface/function names, class method names and declared parameter/return-type text, with one-based source lines. Overloads remain separate declarations; their signature strings are not type-resolved identities.

The prototype withholds all declarations when syntax diagnostics exist and reports unsupported anonymous or computed names. It does not yet produce `RecordEnvelope`, `EvidenceLocator`, `Coverage`, exact file digests, byte spans, stable qualified entity IDs or adapter provenance. Imports, class fields, constructors, accessors, interface methods, nested declarations, TSX and dynamic router registrations are outside this narrow output family; their absence is **not** evidence that they do not exist. A real adapter must establish an eligible-unit denominator and emit coverage/unsupported diagnostics before any completeness claim.

Synthetic tests exercise overloads, a computed method name, an import that is never executed, anonymous declaration and syntax failure. No private evaluation repository content or source-derived fixture is included. Integrate with frozen WP1 records and trusted captures only after the contract and evidence boundaries have passed review.
