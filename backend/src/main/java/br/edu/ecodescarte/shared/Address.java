package br.edu.ecodescarte.shared;

import jakarta.validation.constraints.NotBlank;

public record Address(
        @NotBlank(message = "Informe a rua.") String street,
        @NotBlank(message = "Informe o número.") String number,
        @NotBlank(message = "Informe o bairro.") String neighborhood,
        @NotBlank(message = "Informe a cidade.") String city,
        @NotBlank(message = "Informe o estado.") String state,
        @NotBlank(message = "Informe o CEP.") String zipCode) {
}
