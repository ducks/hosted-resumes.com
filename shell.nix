{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_22
    nodePackages.pnpm
    postgresql
    rustc
    cargo
    pkg-config
    openssl
  ];

  shellHook = ''
    echo "hosted-resumes.com dev environment"
    echo "Node.js: $(node --version)"
    echo "pnpm: $(pnpm --version)"
    echo "PostgreSQL client: $(psql --version)"
    echo "Rust: $(rustc --version)"
  '';
}
