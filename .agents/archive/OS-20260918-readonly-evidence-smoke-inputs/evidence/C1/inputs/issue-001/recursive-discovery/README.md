# Recursive discovery smoke inputs

These files are synthetic and deliberately contain one failing test. Preserve this issued directory; copy it to a new temporary directory before running. The top-level control passes. The nested test is named C1 nested discovery sentinel must be observed and starts with assert.equal(false, true).

In the disposable copy, initialize a Git repository, then run the supplied run-validation.ps1 from that directory. Expect the named nested failure and a nonzero result. Change only the nested false assertion to true and rerun; expect both tests to pass. An empty tests directory must raise No Node test suites discovered. The README portable convenience command node --test must also discover the nested failure and then pass after the same assertion correction. Reset by creating a fresh disposable copy from these originals.
