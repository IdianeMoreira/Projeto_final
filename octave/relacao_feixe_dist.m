% Ângulo (metade do FoV)
alpha = 12.5;

% Converter para radianos
alpha_rad = deg2rad(alpha);

% Valores de distância (0 a 2 metros)
d = linspace(0, 2, 100);

a = d .* tan(alpha_rad);
s = 2 * a; % Espaçamento mínimo para impedir interferência

% Plot
plot(d, a, 'b', 'LineWidth', 2);
grid on;
xlabel('Distância d (m)');
ylabel('a (m) - metade da largura do feixe');
title('Relação entre distância e abertura do feixe');
legend('a = d * tan(12.5°)');

figure
plot(d, s, 'r', 'LineWidth', 2);
grid on;
xlabel('Distância d (m)');
ylabel('2a (m) - largura total do feixe');
title('Relação entre Largura do feixe e distância');
legend('2a = 2 * d * tan(12.5°)');
