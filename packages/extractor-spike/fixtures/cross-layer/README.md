# Synthetic repair-approval fixture

Public-safe, invented source for multi-artifact WP2 conformance. It is not a
sample of a real enterprise product and no tests or services have been run here.

`expected.json` is an independently written assertion set. A scanner may report
more supported facts, but it must recover required facts and must **not** make
the forbidden exact links. Expected business mapping is a reviewed association
in the fixture, not something syntax extraction can prove.

The minimum journey is business passage -> OpenAPI operation -> Spring controller
-> service method -> JPA entity/SQL table -> test declaration. `client.ts` is a
separate TypeScript consumer candidate. Passing this fixture is necessary but not
sufficient for WP2: it does not establish capture authority, access control,
real-repository recall, or actual test execution.
