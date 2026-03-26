{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    volta
    postgresql
  ];

  shellHook = ''
    echo "hosted-resumes.com dev environment"

    # Volta manages Node and pnpm versions
    export VOLTA_HOME="$HOME/.volta"
    export PATH="$VOLTA_HOME/bin:$PATH"

    echo "Volta: $(volta --version 2>/dev/null || echo 'installing...')"
    echo "Node.js: $(node --version 2>/dev/null || echo 'run: volta install node@lts')"
    echo "pnpm: $(pnpm --version 2>/dev/null || echo 'run: volta install pnpm')"
    echo "PostgreSQL client: $(psql --version)"
  '';
}
